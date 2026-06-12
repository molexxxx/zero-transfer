/**
 * Unified checkpoint/resume model shared by every provider.
 *
 * A checkpoint records how far a transfer progressed toward a destination so
 * a later attempt - in the same process or a different one - can resume
 * instead of restarting. Unlike the legacy {@link S3MultipartResumeStore}
 * (which keys by timestamped job id and therefore never matches across
 * processes), checkpoints are keyed by the source and destination
 * provider/path pair, so any job moving the same bytes to the same place can
 * pick up prior work.
 *
 * Two state shapes cover every provider family:
 *
 * - `byte-offset` - providers that append sequentially (SFTP, FTP REST,
 *   local files): a single contiguous committed-byte watermark.
 * - `parts` - providers that upload discrete parts (S3 multipart, Azure
 *   staged blocks): an upload token plus the contiguous prefix of completed
 *   parts.
 *
 * Both shapes expose `committedBytes`, which is all the transfer executor
 * consumes; the parts detail is round-tripped to the owning provider through
 * a {@link TransferCheckpointHandle}.
 *
 * @module transfers/TransferCheckpointStore
 */
import { createHash } from "node:crypto";
import {
  mkdir as fsMkdir,
  readFile as fsReadFile,
  rename as fsRename,
  unlink as fsUnlink,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { join as joinPath } from "node:path";
import { ConfigurationError } from "../errors/ZeroTransferError";

/** One endpoint half of a {@link TransferCheckpointKey}. */
export interface TransferCheckpointEndpoint {
  /** Provider id that owns the endpoint when known. */
  provider?: string;
  /** Provider, remote, or local path for the endpoint. */
  path: string;
}

/**
 * Identity of a checkpointed transfer: the source and destination
 * provider/path pair.
 *
 * Two processes (or two attempts) that move the same source path to the same
 * destination path resolve to the same key, which is what makes cross-process
 * resume possible. Endpoint paths do not embed hostnames; when the same
 * provider/path pair can refer to different servers (for example two SFTP
 * accounts both exposing `/data/out.bin`), set
 * {@link TransferResumeOptions.scope} to disambiguate.
 */
export interface TransferCheckpointKey {
  /** Source endpoint of the transfer. */
  source: TransferCheckpointEndpoint;
  /** Destination endpoint of the transfer. */
  destination: TransferCheckpointEndpoint;
  /** Optional caller-supplied namespace (for example a host or profile id). */
  scope?: string;
}

/**
 * Source-object fingerprint captured when a checkpoint is written.
 *
 * On resume the current source fingerprint is compared against the stored
 * one; any mismatch invalidates the checkpoint so a changed source file is
 * never spliced onto stale destination bytes. At least one field must be
 * comparable for a checkpoint to be considered valid.
 */
export interface TransferSourceFingerprint {
  /** Source size in bytes when known. */
  sizeBytes?: number;
  /** Source modification time in epoch milliseconds when known. */
  modifiedAtMs?: number;
  /** Source entity tag / unique id when the provider exposes one. */
  etag?: string;
}

/** Single completed part recorded in a parts-kind checkpoint. */
export interface TransferCheckpointPart {
  /** One-based part number. */
  partNumber: number;
  /** Cumulative byte offset reached after this part (exclusive). */
  byteEnd: number;
  /** Provider part token (S3 part ETag, Azure block id) when required to finalize. */
  token?: string;
}

/** Byte-offset checkpoint state used by sequential-append providers. */
export interface TransferByteOffsetCheckpointState {
  kind: "byte-offset";
  /** Bytes durably committed at the destination. */
  committedBytes: number;
}

/** Parts checkpoint state used by multipart/staged-block providers. */
export interface TransferPartsCheckpointState {
  kind: "parts";
  /** Provider upload token (S3 `uploadId`, Azure block-id nonce, tus upload URL). */
  uploadToken: string;
  /** Contiguous prefix of completed parts in part-number order. */
  parts: TransferCheckpointPart[];
  /** Bytes durably committed at the destination (end of the contiguous prefix). */
  committedBytes: number;
  /** Part size the upload was cut with; resume must reuse it. */
  partSizeBytes: number;
}

/** Union of checkpoint state shapes. Both expose `committedBytes`. */
export type TransferCheckpointState =
  | TransferByteOffsetCheckpointState
  | TransferPartsCheckpointState;

/** Persisted checkpoint record. */
export interface TransferCheckpointRecord {
  /** Record schema version. */
  version: 1;
  /** Source fingerprint captured when the checkpoint was written. */
  fingerprint: TransferSourceFingerprint;
  /** Progress state. */
  state: TransferCheckpointState;
  /** Epoch ms when this checkpoint was first created. */
  createdAtMs: number;
  /** Epoch ms when this checkpoint was last updated. */
  updatedAtMs: number;
  /** Process id that last wrote the record (concurrent-writer diagnostics). */
  pid: number;
}

/**
 * Persistence contract for transfer checkpoints.
 *
 * Implementations may be synchronous or asynchronous. `clear` is invoked when
 * a transfer completes successfully or a checkpoint is invalidated; it must
 * tolerate missing entries.
 */
export interface TransferCheckpointStore {
  /** Loads the checkpoint for a transfer identity, or `undefined` when absent. */
  load(
    key: TransferCheckpointKey,
  ): Promise<TransferCheckpointRecord | undefined> | TransferCheckpointRecord | undefined;
  /** Persists the checkpoint for a transfer identity. */
  save(key: TransferCheckpointKey, record: TransferCheckpointRecord): Promise<void> | void;
  /** Removes the checkpoint for a transfer identity. */
  clear(key: TransferCheckpointKey): Promise<void> | void;
}

/**
 * Live handle a provider uses to checkpoint part-aware progress during a
 * write.
 *
 * The transfer executor constructs the handle (binding the store, key, and
 * source fingerprint) and attaches it to
 * {@link ProviderTransferWriteRequest.checkpoint}. Providers that upload in
 * discrete parts call {@link save} as the contiguous completed-part prefix
 * advances and read {@link state} to pick up prior progress. Clearing on
 * success is the executor's responsibility - providers only ever record
 * progress.
 */
export interface TransferCheckpointHandle {
  /**
   * Validated state loaded for this transfer, when prior progress exists.
   * `undefined` means start fresh (no checkpoint, or it was invalidated).
   */
  readonly state?: TransferCheckpointState;
  /** Persists new progress state for this transfer. */
  save(state: TransferCheckpointState): Promise<void>;
  /** Removes the stored checkpoint (for example when the provider restarts the upload). */
  clear(): Promise<void>;
}

/** Default checkpoint time-to-live: 7 days, matching S3/Azure uncommitted-upload lifetimes. */
export const DEFAULT_CHECKPOINT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Compares a stored fingerprint against the current source fingerprint.
 *
 * A checkpoint is only trustworthy when at least one field is comparable on
 * both sides and every comparable field matches exactly. A source with no
 * comparable metadata never matches - resuming without any change detection
 * risks corrupting the destination.
 *
 * @param stored - Fingerprint captured when the checkpoint was written.
 * @param current - Fingerprint of the source object right now.
 * @returns `true` when the source is provably unchanged.
 */
export function fingerprintsMatch(
  stored: TransferSourceFingerprint,
  current: TransferSourceFingerprint,
): boolean {
  let comparable = 0;

  if (stored.sizeBytes !== undefined && current.sizeBytes !== undefined) {
    comparable += 1;
    if (stored.sizeBytes !== current.sizeBytes) return false;
  }
  if (stored.modifiedAtMs !== undefined && current.modifiedAtMs !== undefined) {
    comparable += 1;
    if (stored.modifiedAtMs !== current.modifiedAtMs) return false;
  }
  if (stored.etag !== undefined && current.etag !== undefined) {
    comparable += 1;
    if (stored.etag !== current.etag) return false;
  }

  return comparable > 0;
}

/** Options accepted by {@link createMemoryTransferCheckpointStore}. */
export interface MemoryTransferCheckpointStoreOptions {
  /** Checkpoint time-to-live in milliseconds. Defaults to 7 days. */
  ttlMs?: number;
  /** Clock override for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
}

/**
 * Creates an in-memory {@link TransferCheckpointStore}.
 *
 * Suitable for in-process retry resume (the engine's retry policy re-enters
 * the executor with the store still populated) and for tests. Does not
 * survive process restarts - use
 * {@link createFileSystemTransferCheckpointStore} for cross-process resume.
 */
export function createMemoryTransferCheckpointStore(
  options: MemoryTransferCheckpointStoreOptions = {},
): TransferCheckpointStore {
  const ttlMs = normalizeTtlMs(options.ttlMs);
  const now = options.now ?? Date.now;
  const map = new Map<string, TransferCheckpointRecord>();

  return {
    clear: (key) => {
      map.delete(checkpointKeyId(key));
    },
    load: (key) => {
      const id = checkpointKeyId(key);
      const record = map.get(id);
      if (record === undefined) return undefined;
      if (now() - record.updatedAtMs > ttlMs) {
        map.delete(id);
        return undefined;
      }
      return record;
    },
    save: (key, record) => {
      map.set(checkpointKeyId(key), record);
    },
  };
}

/** Options accepted by {@link createFileSystemTransferCheckpointStore}. */
export interface FileSystemTransferCheckpointStoreOptions {
  /**
   * Directory under which checkpoint JSON files are written. Created
   * recursively if it does not exist. Each transfer identity occupies a
   * single file named after a SHA-256 hash of the key, so the directory is
   * safe to share across many concurrent transfers.
   */
  directory: string;
  /**
   * Checkpoint time-to-live in milliseconds. Records older than this are
   * deleted on load and treated as absent. Defaults to 7 days, matching the
   * default lifecycle window for uncommitted S3 multipart uploads and Azure
   * staged blocks - resuming after the remote side has expired its half of
   * the state would fail anyway.
   */
  ttlMs?: number;
  /** Clock override for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
}

/**
 * File-system backed {@link TransferCheckpointStore} that survives process
 * restarts, enabling cross-process resume.
 *
 * Each checkpoint is one JSON file named after a SHA-256 hash of the
 * transfer key. Writes are atomic (`<file>.tmp` then `rename`) with mode
 * `0600`, so a crash mid-write cannot leave a corrupt checkpoint and other
 * local users cannot read transfer metadata. Corrupt or expired files are
 * deleted on load and treated as absent.
 *
 * @example Resumable downloads that survive restarts
 * ```ts
 * import {
 *   createFileSystemTransferCheckpointStore,
 *   createTransferClient,
 *   downloadFile,
 * } from "@zero-transfer/sdk";
 *
 * const store = createFileSystemTransferCheckpointStore({
 *   directory: "./.zt-checkpoints",
 * });
 *
 * const client = createTransferClient({
 *   providers: [createSftpProviderFactory(), createLocalProviderFactory()],
 *   defaults: { resume: { store } },
 * });
 *
 * // Kill the process mid-transfer and run it again: the download resumes
 * // from the last committed byte instead of restarting.
 * await downloadFile({ client, source, destination });
 * ```
 */
export function createFileSystemTransferCheckpointStore(
  options: FileSystemTransferCheckpointStoreOptions,
): TransferCheckpointStore {
  const directory = options.directory;
  if (typeof directory !== "string" || directory.length === 0) {
    throw new ConfigurationError({
      message: "createFileSystemTransferCheckpointStore requires a non-empty directory option",
      retryable: false,
    });
  }
  const ttlMs = normalizeTtlMs(options.ttlMs);
  const now = options.now ?? Date.now;

  const fileFor = (key: TransferCheckpointKey): string => {
    const hash = createHash("sha256").update(checkpointKeyId(key)).digest("hex");
    return joinPath(directory, `${hash}.json`);
  };

  const remove = async (file: string): Promise<void> => {
    try {
      await fsUnlink(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  };

  return {
    async clear(key) {
      await remove(fileFor(key));
    },
    async load(key) {
      const file = fileFor(key);
      let text: string;
      try {
        text = await fsReadFile(file, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
      const record = parseCheckpointRecord(text);
      if (record === undefined || now() - record.updatedAtMs > ttlMs) {
        await remove(file);
        return undefined;
      }
      return record;
    },
    async save(key, record) {
      await fsMkdir(directory, { recursive: true });
      const target = fileFor(key);
      const tmp = `${target}.${String(process.pid)}.${String(now())}.tmp`;
      await fsWriteFile(tmp, JSON.stringify(record), { encoding: "utf8", mode: 0o600 });
      await fsRename(tmp, target);
    },
  };
}

/** Canonical string identity for a checkpoint key (also the hash input for file names). */
function checkpointKeyId(key: TransferCheckpointKey): string {
  return [
    "v1",
    key.source.provider ?? "",
    key.source.path,
    key.destination.provider ?? "",
    key.destination.path,
    key.scope ?? "",
  ].join("\u0000");
}

/** Validates a persisted record, returning `undefined` for anything malformed. */
function parseCheckpointRecord(text: string): TransferCheckpointRecord | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) return undefined;
  const record = parsed as Partial<TransferCheckpointRecord>;
  if (record.version !== 1) return undefined;
  if (typeof record.createdAtMs !== "number" || typeof record.updatedAtMs !== "number") {
    return undefined;
  }
  if (typeof record.fingerprint !== "object" || record.fingerprint === null) return undefined;
  if (!isValidCheckpointState(record.state)) return undefined;
  return record as TransferCheckpointRecord;
}

function isValidCheckpointState(state: unknown): state is TransferCheckpointState {
  if (typeof state !== "object" || state === null) return false;
  const candidate = state as {
    kind?: unknown;
    committedBytes?: unknown;
    uploadToken?: unknown;
    partSizeBytes?: unknown;
    parts?: unknown;
  };
  if (typeof candidate.committedBytes !== "number" || candidate.committedBytes < 0) return false;
  if (candidate.kind === "byte-offset") return true;
  if (candidate.kind !== "parts") return false;
  return (
    typeof candidate.uploadToken === "string" &&
    typeof candidate.partSizeBytes === "number" &&
    Array.isArray(candidate.parts) &&
    candidate.parts.every(
      (part: unknown) =>
        typeof part === "object" &&
        part !== null &&
        typeof (part as TransferCheckpointPart).partNumber === "number" &&
        typeof (part as TransferCheckpointPart).byteEnd === "number",
    )
  );
}

function normalizeTtlMs(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_CHECKPOINT_TTL_MS;
  }
  return Math.floor(value);
}
