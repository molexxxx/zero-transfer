/**
 * Pipelined SFTP transfers: sliding-window reads and bounded in-flight writes
 * over the already-concurrent {@link SftpSession}.
 *
 * The serial read loop costs one round trip per 32 KiB chunk, so throughput
 * collapses on high-latency links (a 100 ms RTT caps a serial stream at
 * ~320 KiB/s). Keeping a window of outstanding requests in flight - OpenSSH's
 * own client defaults to 64 requests of 32 KiB - hides the round trips and
 * lets a single SFTP session saturate the path.
 *
 * Reads use a strict-FIFO sliding window: up to `maxInFlight` `SSH_FXP_READ`
 * requests are outstanding, chunks are emitted in offset order, and the
 * consumer's pull pace is the backpressure (no further requests are issued
 * until the window has room). Writes issue up to `maxInFlight` un-awaited
 * `SSH_FXP_WRITE` requests and report progress only on the contiguous
 * acknowledged watermark, which keeps progress monotonic and makes the
 * watermark safe to persist as a byte-offset checkpoint.
 *
 * @module providers/native/sftp/sftpPipeline
 */
import { Buffer } from "node:buffer";
import type { SftpSession } from "../../../protocols/sftp/v3/SftpSession";

/**
 * Tuning for pipelined SFTP transfers.
 *
 * The default window is 64 requests x 32 KiB = 2 MiB, matching the OpenSSH
 * client's defaults and the SSH channel window used by the native transport.
 */
export interface SftpPipelineOptions {
  /**
   * Maximum number of SFTP requests kept in flight. Defaults to `64`.
   * `1` reproduces the serial one-request-at-a-time behavior.
   */
  maxInFlight?: number;
  /**
   * Bytes requested per `SSH_FXP_READ` / written per `SSH_FXP_WRITE`.
   * Defaults to `32768` (32 KiB). Clamped to 240 KiB so every message stays
   * within the 256 KiB SFTP packet cap with framing overhead to spare.
   */
  chunkBytes?: number;
}

/** Default maximum in-flight SFTP requests (OpenSSH client default). */
export const SFTP_PIPELINE_DEFAULT_MAX_IN_FLIGHT = 64;

/** Default SFTP transfer chunk size in bytes (OpenSSH client default). */
export const SFTP_PIPELINE_DEFAULT_CHUNK_BYTES = 32_768;

/** Upper bound for {@link SftpPipelineOptions.chunkBytes}: 240 KiB, inside the 256 KiB packet cap. */
export const SFTP_PIPELINE_MAX_CHUNK_BYTES = 245_760;

/** Resolved pipeline tuning with defaults and clamps applied. */
export interface ResolvedSftpPipelineOptions {
  maxInFlight: number;
  chunkBytes: number;
}

/**
 * Applies defaults and clamps to user-supplied pipeline tuning.
 *
 * @param options - Optional user tuning.
 * @returns Tuning with defaults applied and `chunkBytes` clamped to the packet-safe maximum.
 */
export function resolveSftpPipelineOptions(
  options: SftpPipelineOptions | undefined,
): ResolvedSftpPipelineOptions {
  const maxInFlight = normalizePositiveInteger(
    options?.maxInFlight,
    SFTP_PIPELINE_DEFAULT_MAX_IN_FLIGHT,
  );
  const chunkBytes = Math.min(
    normalizePositiveInteger(options?.chunkBytes, SFTP_PIPELINE_DEFAULT_CHUNK_BYTES),
    SFTP_PIPELINE_MAX_CHUNK_BYTES,
  );
  return { chunkBytes, maxInFlight };
}

/** Input for {@link pipelinedSftpRead}. */
export interface SftpPipelinedReadInput {
  /** Connected SFTP session. */
  sftp: SftpSession;
  /** Open file handle (read mode). */
  handle: Uint8Array;
  /** Absolute byte offset to start reading at. */
  offset: number;
  /** Total bytes to read. */
  length: number;
  /** Resolved pipeline tuning. */
  pipeline: ResolvedSftpPipelineOptions;
  /** Abort check invoked before each emission. */
  throwIfAborted?: () => void;
}

/**
 * Reads a byte range through a sliding window of outstanding SFTP requests,
 * emitting chunks in strict offset order.
 *
 * Backpressure is the consumer's pull: a new request is issued only when an
 * emitted chunk frees a window slot, so at most
 * `maxInFlight x chunkBytes` bytes are buffered. Servers may legally return
 * fewer bytes than requested (`sftp-server` caps responses by its own
 * limits), so each window slot re-issues reads until its sub-range is
 * complete or EOF is reached. If the file ends early (it shrank after stat),
 * emission stops cleanly at the server's EOF.
 *
 * The generator's `finally` drains every outstanding request before
 * returning, so callers can close the file handle immediately afterwards
 * without racing in-flight reads.
 *
 * @param input - Session, handle, range, and tuning.
 * @returns Async generator of chunks in offset order.
 */
export async function* pipelinedSftpRead(
  input: SftpPipelinedReadInput,
): AsyncGenerator<Uint8Array> {
  const { sftp, handle, pipeline } = input;
  if (input.length <= 0) return;

  let nextOffset = input.offset;
  let remaining = input.length;
  const window: Array<Promise<Buffer | null>> = [];

  const issueNext = (): void => {
    if (remaining <= 0) return;
    const slotLength = Math.min(pipeline.chunkBytes, remaining);
    const slotOffset = nextOffset;
    nextOffset += slotLength;
    remaining -= slotLength;
    const promise = readFullSlot(sftp, handle, slotOffset, slotLength);
    // Mark queued rejections as handled; the awaiting consumer still
    // observes the original rejection in FIFO order.
    void promise.catch(() => undefined);
    window.push(promise);
  };

  try {
    while (window.length < pipeline.maxInFlight && remaining > 0) issueNext();

    while (window.length > 0) {
      const head = window[0];
      if (head === undefined) break;
      const data = await head;
      void window.shift();
      if (data === null || data.length === 0) {
        // EOF before the stat-derived end: the file shrank. Stop emitting.
        return;
      }
      input.throwIfAborted?.();
      yield new Uint8Array(data);
      issueNext();
    }
  } finally {
    // Drain outstanding requests so the caller can close the handle safely.
    await Promise.allSettled(window);
  }
}

/**
 * Reads one window slot to completion, accumulating short reads until the
 * requested sub-range is filled or the server reports EOF.
 */
async function readFullSlot(
  sftp: SftpSession,
  handle: Uint8Array,
  offset: number,
  length: number,
): Promise<Buffer | null> {
  let collected: Buffer | undefined;
  let received = 0;

  while (received < length) {
    const data = await sftp.read(handle, BigInt(offset + received), length - received);
    if (data === null) break;
    if (collected === undefined && data.length === length) return data;
    collected = collected === undefined ? data : Buffer.concat([collected, data]);
    received += data.length;
  }

  return collected ?? null;
}

/** Input for {@link pipelinedSftpWrite}. */
export interface SftpPipelinedWriteInput {
  /** Connected SFTP session. */
  sftp: SftpSession;
  /** Open file handle (write mode). */
  handle: Uint8Array;
  /** Absolute byte offset to start writing at (resume offset). */
  startOffset: number;
  /** Content to write. Chunks of any size; the pipeline re-slices them. */
  content: AsyncIterable<Uint8Array>;
  /** Resolved pipeline tuning. */
  pipeline: ResolvedSftpPipelineOptions;
  /** Abort check invoked between writes. */
  throwIfAborted?: () => void;
  /**
   * Observes the contiguous acknowledged watermark. `ackedBytes` is relative
   * to the start of this write (engine progress semantics);
   * `absoluteOffset` includes the resume offset (checkpoint semantics). Both
   * are monotonic and never include unacknowledged in-flight bytes.
   */
  onAck?: (ackedBytes: number, absoluteOffset: number) => void;
}

/**
 * Writes a content stream through a bounded window of un-awaited SFTP write
 * requests.
 *
 * Up to `maxInFlight` writes are outstanding; when the window is full the
 * oldest write is awaited before the next is issued, which bounds buffered
 * memory at `maxInFlight x chunkBytes` and makes the acknowledgement
 * watermark contiguous: because acknowledgements are consumed in issue
 * order, `onAck` always describes a prefix of the file with no holes - safe
 * to persist as a resume checkpoint even though later writes may already
 * have completed out of order.
 *
 * On the first failure the pipeline stops issuing, settles every outstanding
 * write, and rethrows the earliest failure in issue order.
 *
 * @param input - Session, handle, offset, content, and tuning.
 * @returns Total bytes written by this call (excluding the resume offset).
 */
export async function pipelinedSftpWrite(input: SftpPipelinedWriteInput): Promise<number> {
  const { sftp, handle, pipeline } = input;

  interface InFlightWrite {
    promise: Promise<void>;
    /** Bytes written relative to startOffset once this write is acknowledged. */
    end: number;
  }

  const window: InFlightWrite[] = [];
  let issuedBytes = 0;
  let ackedBytes = 0;

  const awaitOldest = async (): Promise<void> => {
    const oldest = window[0];
    if (oldest === undefined) return;
    window.shift();
    await oldest.promise;
    ackedBytes = oldest.end;
    input.onAck?.(ackedBytes, input.startOffset + ackedBytes);
  };

  const issueWrite = (bytes: Uint8Array): void => {
    const writeOffset = BigInt(input.startOffset + issuedBytes);
    issuedBytes += bytes.byteLength;
    const promise = sftp.write(handle, writeOffset, bytes);
    void promise.catch(() => undefined);
    window.push({ end: issuedBytes, promise });
  };

  try {
    for await (const chunk of input.content) {
      input.throwIfAborted?.();
      if (chunk.byteLength === 0) continue;

      for (let position = 0; position < chunk.byteLength; position += pipeline.chunkBytes) {
        const slice = chunk.subarray(
          position,
          Math.min(position + pipeline.chunkBytes, chunk.byteLength),
        );
        if (window.length >= pipeline.maxInFlight) await awaitOldest();
        input.throwIfAborted?.();
        issueWrite(slice);
      }
    }

    while (window.length > 0) await awaitOldest();
    return ackedBytes;
  } finally {
    // First failure (or consumer abort) lands here with writes still in
    // flight: settle them all so no acknowledgement races the handle close.
    await Promise.allSettled(window.map((entry) => entry.promise));
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}
