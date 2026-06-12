/**
 * Shared parallel multipart upload machinery for part-based providers
 * (S3 multipart uploads, Azure staged blocks).
 *
 * Two pieces compose:
 *
 * - {@link createSequentialPartReader} - a mutex-guarded reader that cuts an
 *   async byte stream into fixed-size parts with deterministic part numbers
 *   assigned at cut time. The source is only ever pulled by one consumer at a
 *   time, so part contents and numbering are identical regardless of how many
 *   workers race to call `next()`.
 * - {@link runMultipartUploadPool} - N workers pulling parts from the reader
 *   and uploading them concurrently. Buffered memory is bounded at
 *   `(partConcurrency + 1) x partSizeBytes` (one part per worker plus the
 *   part being cut). Completion notifications fire only as the *contiguous*
 *   prefix of finished parts advances, which keeps progress monotonic and
 *   checkpoints safe under out-of-order completion.
 *
 * `partConcurrency: 1` reproduces the sequential upload behavior bit-for-bit.
 *
 * @module providers/web/multipartUploadPool
 */

/** One part cut from the source stream. */
export interface MultipartPart {
  /** One-based part number, assigned in cut order. */
  partNumber: number;
  /** Part payload. Exactly `partSizeBytes` long except for the final part. */
  bytes: Uint8Array;
  /** Absolute byte offset of the first byte of this part. */
  byteStart: number;
  /** Absolute byte offset after the last byte of this part (exclusive). */
  byteEnd: number;
}

/** Sequential part source shared by upload workers. */
export interface MultipartPartReader {
  /**
   * Cuts and returns the next part, or `undefined` when the source is
   * exhausted. Concurrent calls are serialized internally.
   */
  next(): Promise<MultipartPart | undefined>;
}

/** Options for {@link createSequentialPartReader}. */
export interface SequentialPartReaderOptions {
  /** Source byte stream. */
  source: AsyncIterable<Uint8Array>;
  /** Bytes per part (final part may be smaller). */
  partSizeBytes: number;
  /**
   * Leading bytes already pulled from the source (for example a
   * single-shot-threshold probe) that must be re-slotted ahead of remaining
   * source chunks.
   */
  initialChunks?: Uint8Array[];
  /** Part number assigned to the first part produced. Defaults to `1`. */
  startPartNumber?: number;
  /** Absolute byte offset of the first part produced. Defaults to `0`. */
  startOffset?: number;
}

/**
 * Creates a mutex-guarded sequential part reader over a byte stream.
 *
 * Part numbers and byte ranges are assigned deterministically at cut time:
 * with the same source and part size, part N always contains the same bytes
 * no matter how many concurrent workers consume the reader.
 *
 * @param options - Source stream, part size, and optional resume offsets.
 * @returns Reader whose `next()` yields parts in cut order.
 */
export function createSequentialPartReader(
  options: SequentialPartReaderOptions,
): MultipartPartReader {
  const iterator = options.source[Symbol.asyncIterator]();
  const partSize = options.partSizeBytes;
  let pending: Uint8Array[] = [...(options.initialChunks ?? [])];
  let pendingBytes = pending.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  let nextPartNumber = options.startPartNumber ?? 1;
  let nextOffset = options.startOffset ?? 0;
  let exhausted = false;
  // Serializes next() so exactly one consumer pulls the source at a time.
  let mutex: Promise<MultipartPart | undefined> = Promise.resolve(undefined);

  const cutPart = (size: number): MultipartPart => {
    const bytes = takeBytes(pending, pendingBytes, size);
    pending = bytes.remaining;
    pendingBytes -= bytes.taken.byteLength;
    const part: MultipartPart = {
      byteEnd: nextOffset + bytes.taken.byteLength,
      byteStart: nextOffset,
      bytes: bytes.taken,
      partNumber: nextPartNumber,
    };
    nextPartNumber += 1;
    nextOffset = part.byteEnd;
    return part;
  };

  const nextLocked = async (): Promise<MultipartPart | undefined> => {
    while (pendingBytes < partSize && !exhausted) {
      const result = await iterator.next();
      if (result.done === true) {
        exhausted = true;
        break;
      }
      if (result.value.byteLength === 0) continue;
      pending.push(result.value);
      pendingBytes += result.value.byteLength;
    }

    if (pendingBytes === 0) return undefined;
    return cutPart(Math.min(partSize, pendingBytes));
  };

  return {
    next: () => {
      const result = mutex.then(nextLocked);
      mutex = result.catch(() => undefined);
      return result;
    },
  };
}

/** A finished part paired with the uploader's result. */
export interface MultipartUploadedPart<TResult> {
  /** Part metadata (payload bytes are released after upload). */
  partNumber: number;
  /** Absolute byte offset of the first byte of this part. */
  byteStart: number;
  /** Absolute byte offset after the last byte of this part (exclusive). */
  byteEnd: number;
  /** Value returned by the part uploader (ETag, block id, ...). */
  result: TResult;
}

/** Options for {@link runMultipartUploadPool}. */
export interface MultipartUploadPoolOptions<TResult> {
  /** Sequential part source (see {@link createSequentialPartReader}). */
  reader: MultipartPartReader;
  /**
   * Number of parts uploaded concurrently. `1` reproduces sequential
   * behavior. Memory bound: `(partConcurrency + 1) x partSizeBytes`.
   */
  partConcurrency: number;
  /**
   * Part number of the first part the reader will produce (the reader's
   * `startPartNumber`). Anchors contiguous-prefix commit tracking. Defaults
   * to `1`.
   */
  firstPartNumber?: number;
  /** Uploads one part and returns its provider token (ETag, block id, ...). */
  uploadPart(part: MultipartPart): Promise<TResult>;
  /**
   * Observes the contiguous prefix of completed parts advancing. Called once
   * per part in strict part-number order; `committedBytes` is the byte end
   * of the contiguous prefix. Parts completed beyond a still-uploading gap
   * are *not* reported until the gap closes, so the value is monotonic and
   * safe to checkpoint. Awaited before further notifications fire.
   */
  onCommitted?(part: MultipartUploadedPart<TResult>, committedBytes: number): Promise<void> | void;
  /** Abort check invoked before each part upload. */
  throwIfAborted?: () => void;
}

/** Result of {@link runMultipartUploadPool}. */
export interface MultipartUploadPoolResult<TResult> {
  /** All uploaded parts sorted by part number. */
  parts: Array<MultipartUploadedPart<TResult>>;
  /** Total bytes uploaded by this run. */
  bytesUploaded: number;
}

/**
 * Uploads parts from a reader with bounded concurrency.
 *
 * Workers race on the shared reader (which serializes cutting), upload their
 * parts, and record results. The first failure stops all issuance, waits for
 * in-flight uploads to settle, and rethrows; remaining workers observe the
 * failure and stop pulling new parts.
 *
 * Finalization order is the caller's job: the returned parts are sorted by
 * `partNumber` (never completion order), ready for `CompleteMultipartUpload`
 * / `Put Block List`.
 *
 * @param options - Reader, concurrency, part uploader, and commit observer.
 * @returns Uploaded parts (part-number order) and total bytes uploaded.
 */
export async function runMultipartUploadPool<TResult>(
  options: MultipartUploadPoolOptions<TResult>,
): Promise<MultipartUploadPoolResult<TResult>> {
  const concurrency = Math.max(1, Math.floor(options.partConcurrency));
  const completed = new Map<number, MultipartUploadedPart<TResult>>();
  let failure: unknown;
  let failed = false;

  // Contiguous-prefix commit tracking. Notifications are chained so they
  // fire strictly in part-number order even when parts finish out of order.
  let nextToCommit = Math.max(1, Math.floor(options.firstPartNumber ?? 1));
  let commitChain: Promise<void> = Promise.resolve();

  const scheduleCommits = (): void => {
    if (options.onCommitted === undefined) return;
    while (completed.has(nextToCommit)) {
      const part = completed.get(nextToCommit);
      if (part === undefined) break;
      commitChain = commitChain.then(() => options.onCommitted?.(part, part.byteEnd));
      nextToCommit += 1;
    }
  };

  const worker = async (): Promise<void> => {
    while (!failed) {
      options.throwIfAborted?.();
      const part = await options.reader.next();
      if (part === undefined || failed) return;

      const result = await options.uploadPart(part);
      completed.set(part.partNumber, {
        byteEnd: part.byteEnd,
        byteStart: part.byteStart,
        partNumber: part.partNumber,
        result,
      });
      scheduleCommits();
    }
  };

  const workers: Array<Promise<void>> = [];
  for (let index = 0; index < concurrency; index += 1) {
    workers.push(
      worker().catch((error: unknown) => {
        if (!failed) {
          failed = true;
          failure = error;
        }
      }),
    );
  }

  await Promise.all(workers);
  await commitChain;

  if (failed) throw failure;

  const parts = [...completed.values()].sort((a, b) => a.partNumber - b.partNumber);
  const bytesUploaded = parts.reduce((sum, part) => sum + (part.byteEnd - part.byteStart), 0);
  return { bytesUploaded, parts };
}

/** Takes exactly `size` bytes from the front of `chunks` without copying when a chunk aligns. */
function takeBytes(
  chunks: Uint8Array[],
  totalBytes: number,
  size: number,
): { taken: Uint8Array; remaining: Uint8Array[] } {
  const first = chunks[0];
  if (first !== undefined && first.byteLength === size) {
    return { remaining: chunks.slice(1), taken: first };
  }
  if (first !== undefined && first.byteLength > size) {
    const remaining = chunks.slice(1);
    remaining.unshift(first.subarray(size));
    return { remaining, taken: first.subarray(0, size) };
  }

  const taken = new Uint8Array(Math.min(size, totalBytes));
  let offset = 0;
  let index = 0;
  while (offset < taken.byteLength && index < chunks.length) {
    const chunk = chunks[index];
    if (chunk === undefined) break;
    const needed = taken.byteLength - offset;
    if (chunk.byteLength <= needed) {
      taken.set(chunk, offset);
      offset += chunk.byteLength;
      index += 1;
    } else {
      taken.set(chunk.subarray(0, needed), offset);
      const remaining = chunks.slice(index + 1);
      remaining.unshift(chunk.subarray(needed));
      return { remaining, taken };
    }
  }
  return { remaining: chunks.slice(index), taken };
}
