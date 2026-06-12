/**
 * S3-compatible provider.
 *
 * Talks to S3-compatible REST endpoints (AWS S3, MinIO, R2, Backblaze B2 S3
 * compatibility, Wasabi, etc.) with SigV4 signing. Supports `list` (ListObjectsV2),
 * `stat` (HEAD object), `read` (GET with optional `Range`), and `write` via
 * multipart upload (enabled by default, streaming in fixed-size parts) or a
 * streamed single-shot `PUT` when multipart is disabled.
 *
 * @module providers/web/S3Provider
 */
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import { createHash } from "node:crypto";
import {
  mkdir as fsMkdir,
  readFile as fsReadFile,
  rename as fsRename,
  unlink as fsUnlink,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { join as joinPath } from "node:path";
import {
  ConfigurationError,
  ConnectionError,
  UnsupportedFeatureError,
} from "../../errors/ZeroTransferError";
import { redactUrlForLogging } from "../../logging/redaction";
import { resolveSecret, type SecretSource } from "../../profiles/SecretSource";
import type { ConnectionProfile, RemoteEntry, RemoteStat } from "../../types/public";
import { basenameRemotePath, normalizeRemotePath } from "../../utils/path";
import type { TransferProvider } from "../Provider";
import type { ProviderFactory } from "../ProviderFactory";
import type {
  ProviderTransferDiscardRequest,
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../ProviderTransferOperations";
import type { RemoteFileSystem } from "../RemoteFileSystem";
import type { TransferPartsCheckpointState } from "../../transfers/TransferCheckpointStore";
import { signSigV4 } from "./awsSigv4";
import { createSequentialPartReader, runMultipartUploadPool } from "./multipartUploadPool";
import {
  asyncIterableToReadableStream,
  formatRangeHeader,
  mapResponseErrorWithBody,
  parseTotalBytes,
  secretToString,
  webStreamToAsyncIterable,
  type HttpFetch,
} from "./httpInternals";

export type { HttpFetch };

/** Options accepted by {@link createS3ProviderFactory}. */
export interface S3ProviderOptions {
  /** Provider id to register. Defaults to `"s3"`. */
  id?: ProviderId;
  /** Required bucket name; can be overridden per connection via `profile.host`. */
  bucket?: string;
  /** AWS region. Defaults to `"us-east-1"`. */
  region?: string;
  /** Service identifier for SigV4. Defaults to `"s3"`. */
  service?: string;
  /** Custom endpoint base URL (e.g. MinIO, R2). Defaults to `https://s3.<region>.amazonaws.com`. */
  endpoint?: string;
  /** Whether to use path-style URLs (`endpoint/bucket/key`). Defaults to `true`. */
  pathStyle?: boolean;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied to every request before signing. */
  defaultHeaders?: Record<string, string>;
  /** Optional STS session token applied to every request. */
  sessionToken?: SecretSource;
  /** Multipart upload tuning. Enabled by default; see {@link S3MultipartOptions.enabled}. */
  multipart?: S3MultipartOptions;
}

/** Multipart upload tuning for the S3 provider. */
export interface S3MultipartOptions {
  /**
   * Enable multipart upload. **Defaults to `true`** so large objects stream
   * in fixed-size parts instead of being buffered in memory before a single
   * `PUT`. Payloads at or below {@link S3MultipartOptions.thresholdBytes}
   * still fall back to a single-shot `PUT` automatically. Set to `false` to
   * force single-shot behaviour (e.g. when targeting an S3-compatible
   * endpoint that does not support `CreateMultipartUpload`). Single-shot
   * uploads stream with `UNSIGNED-PAYLOAD` signing when the total size is
   * known; S3 requires a `Content-Length` up front, so unknown-size payloads
   * are buffered entirely in memory on this path.
   */
  enabled?: boolean;
  /** Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. */
  thresholdBytes?: number;
  /** Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. */
  partSizeBytes?: number;
  /**
   * Number of parts uploaded concurrently. Defaults to `4`; `1` reproduces
   * the sequential one-part-at-a-time behavior. Buffered memory is bounded
   * at `(partConcurrency + 1) x partSizeBytes` (32 + 8 MiB with defaults).
   * Progress and resume checkpoints advance on the contiguous prefix of
   * completed parts, so they stay monotonic under parallel completion.
   */
  partConcurrency?: number;
  /**
   * Optional persistent store enabling cross-process resume of incomplete
   * multipart uploads. When provided, in-flight `uploadId` plus uploaded part
   * etags are checkpointed after every part; on retry the upload reuses the
   * stored state and skips the bytes already transferred.
   *
   * @deprecated Use the unified checkpoint model instead: pass
   * `resume: { store: createFileSystemTransferCheckpointStore(...) }` to
   * {@link runRoute} / the transfer helpers (or set it as a client default).
   * Unified checkpoints are keyed by source+destination path - not by job id
   * - so they match across processes, and they work for every provider, not
   * just S3. This store remains supported for compatibility.
   */
  resumeStore?: S3MultipartResumeStore;
}

/** Resume key identifying an in-flight multipart upload. */
export interface S3MultipartResumeKey {
  bucket: string;
  jobId: string;
  path: string;
}

/** Persisted multipart-upload checkpoint. */
export interface S3MultipartCheckpoint {
  uploadId: string;
  /** Parts already accepted by S3, in upload order. */
  parts: ReadonlyArray<S3MultipartPart>;
}

/** Single part recorded in a multipart-upload checkpoint. */
export interface S3MultipartPart {
  partNumber: number;
  etag: string;
  /** Cumulative byte offset reached after this part (exclusive). */
  byteEnd: number;
}

/**
 * Persistence contract for resuming partial multipart uploads across
 * processes or retries. Implementations may be synchronous or asynchronous;
 * `clear` is invoked once the multipart upload completes successfully (or is
 * explicitly aborted).
 */
export interface S3MultipartResumeStore {
  load(
    key: S3MultipartResumeKey,
  ): Promise<S3MultipartCheckpoint | undefined> | S3MultipartCheckpoint | undefined;
  save(key: S3MultipartResumeKey, checkpoint: S3MultipartCheckpoint): Promise<void> | void;
  clear(key: S3MultipartResumeKey): Promise<void> | void;
}

/** Creates an in-memory {@link S3MultipartResumeStore}. */
export function createMemoryS3MultipartResumeStore(): S3MultipartResumeStore {
  const map = new Map<string, S3MultipartCheckpoint>();
  const stringify = (key: S3MultipartResumeKey): string =>
    `${key.bucket}\u0000${key.jobId}\u0000${key.path}`;
  return {
    clear: (key) => {
      map.delete(stringify(key));
    },
    load: (key) => map.get(stringify(key)),
    save: (key, checkpoint) => {
      map.set(stringify(key), checkpoint);
    },
  };
}

/** Options for {@link createFileSystemS3MultipartResumeStore}. */
export interface FileSystemS3MultipartResumeStoreOptions {
  /**
   * Directory under which checkpoint JSON files are written. Created
   * recursively if it does not exist. Each upload occupies a single file
   * named after a SHA-256 hash of the resume key, so the directory is safe
   * to share across many concurrent uploads.
   */
  directory: string;
}

/**
 * File-system backed {@link S3MultipartResumeStore} that survives process
 * restarts. Each in-flight multipart upload is checkpointed to a single
 * JSON file in `options.directory` after every part. On retry the upload
 * reuses the stored `uploadId` and skips parts that S3 has already
 * accepted.
 *
 * The implementation writes atomically (`<file>.tmp` then `rename`) so a
 * crash mid-write cannot leave a corrupt checkpoint.
 *
 * @example
 * ```ts
 * import { createFileSystemS3MultipartResumeStore, createS3ProviderFactory }
 *   from "@zero-transfer/sdk";
 *
 * const resumeStore = createFileSystemS3MultipartResumeStore({
 *   directory: "./.zt-s3-resume",
 * });
 *
 * const factory = createS3ProviderFactory({
 *   multipart: { enabled: true, resumeStore },
 * });
 * ```
 */
export function createFileSystemS3MultipartResumeStore(
  options: FileSystemS3MultipartResumeStoreOptions,
): S3MultipartResumeStore {
  const directory = options.directory;
  if (typeof directory !== "string" || directory.length === 0) {
    throw new ConfigurationError({
      message: "createFileSystemS3MultipartResumeStore requires a non-empty directory option",
      retryable: false,
    });
  }

  const fileFor = (key: S3MultipartResumeKey): string => {
    const hash = createHash("sha256")
      .update(`${key.bucket}\u0000${key.jobId}\u0000${key.path}`)
      .digest("hex");
    return joinPath(directory, `${hash}.json`);
  };

  return {
    async clear(key) {
      try {
        await fsUnlink(fileFor(key));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    },
    async load(key) {
      try {
        const text = await fsReadFile(fileFor(key), "utf8");
        const parsed = JSON.parse(text) as S3MultipartCheckpoint;
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof parsed.uploadId !== "string" ||
          !Array.isArray(parsed.parts)
        ) {
          return undefined;
        }
        return parsed;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
    },
    async save(key, checkpoint) {
      await fsMkdir(directory, { recursive: true });
      const target = fileFor(key);
      const tmp = `${target}.${String(process.pid)}.${String(Date.now())}.tmp`;
      await fsWriteFile(tmp, JSON.stringify(checkpoint), { encoding: "utf8", mode: 0o600 });
      await fsRename(tmp, target);
    },
  };
}

const DEFAULT_MULTIPART_PART_SIZE = 8 * 1024 * 1024;
const DEFAULT_MULTIPART_THRESHOLD = 8 * 1024 * 1024;
const DEFAULT_MULTIPART_PART_CONCURRENCY = 4;

const S3_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["etag"];

/**
 * Creates an S3-compatible provider factory.
 *
 * Credentials must be supplied via the connection profile: `username` is the
 * access key id and `password` is the secret access key. `profile.host` may
 * be set to the bucket name (taking precedence over `options.bucket`).
 *
 * Works with AWS S3 and any S3-compatible API (MinIO, Cloudflare R2,
 * Backblaze B2, DigitalOcean Spaces, Wasabi, etc.) via `options.endpoint`.
 *
 * @example AWS S3
 * ```ts
 * import { createS3ProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createS3ProviderFactory()] });
 *
 * const session = await client.connect({
 *   host: "my-bucket",
 *   provider: "s3",
 *   username: process.env.AWS_ACCESS_KEY_ID,
 *   password: { env: "AWS_SECRET_ACCESS_KEY" },
 *   s3: { region: "us-east-1" },
 * });
 * ```
 *
 * @example MinIO / R2 / S3-compatible endpoint
 * ```ts
 * const client = createTransferClient({
 *   providers: [createS3ProviderFactory({
 *     endpoint: "https://minio.internal:9000",
 *     pathStyle: true,
 *   })],
 * });
 * ```
 */
export function createS3ProviderFactory(options: S3ProviderOptions = {}): ProviderFactory {
  const id: ProviderId = options.id ?? "s3";
  const region = options.region ?? "us-east-1";
  const service = options.service ?? "s3";
  const pathStyle = options.pathStyle ?? true;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const endpoint = options.endpoint ?? `https://s3.${region}.amazonaws.com`;

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply S3ProviderOptions.fetch explicitly",
      retryable: false,
    });
  }
  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: { endpoint },
      message: "S3 provider received an invalid endpoint URL",
      retryable: false,
    });
  }

  const multipartEnabled = options.multipart?.enabled ?? true;
  const multipart: ResolvedMultipartOptions = {
    enabled: multipartEnabled,
    partConcurrency: Math.max(
      1,
      Math.floor(options.multipart?.partConcurrency ?? DEFAULT_MULTIPART_PART_CONCURRENCY),
    ),
    partSizeBytes: options.multipart?.partSizeBytes ?? DEFAULT_MULTIPART_PART_SIZE,
    thresholdBytes: options.multipart?.thresholdBytes ?? DEFAULT_MULTIPART_THRESHOLD,
    ...(options.multipart?.resumeStore !== undefined
      ? { resumeStore: options.multipart.resumeStore }
      : {}),
  };

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["password", "token"],
    checksum: [...S3_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 16,
    metadata: ["modifiedAt", "mimeType", "uniqueId"],
    notes: multipartEnabled
      ? [
          `S3 multipart upload enabled by default (partSize=${String(multipart.partSizeBytes)}B, threshold=${String(multipart.thresholdBytes)}B, partConcurrency=${String(multipart.partConcurrency)}).`,
          "Parts upload in parallel; progress and checkpoints advance on the contiguous completed prefix.",
          "Payloads at or below the threshold automatically fall back to single-shot PUT.",
          "Pass `multipart: { enabled: false }` to force the legacy single-shot behaviour.",
        ]
      : [
          "S3 provider performs single-shot PUT uploads; entire object is buffered in memory before transmission.",
        ],
    provider: id,
    readStream: true,
    resumeDownload: true,
    resumeUpload: multipartEnabled,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: true,
  };

  return {
    capabilities,
    create: () =>
      new S3Provider({
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        endpointUrl,
        fetch: fetchImpl,
        id,
        multipart,
        pathStyle,
        region,
        service,
        ...(options.bucket !== undefined ? { bucket: options.bucket } : {}),
        ...(options.sessionToken !== undefined ? { sessionToken: options.sessionToken } : {}),
      }),
    id,
  };
}

interface ResolvedMultipartOptions {
  enabled: boolean;
  partConcurrency: number;
  partSizeBytes: number;
  thresholdBytes: number;
  resumeStore?: S3MultipartResumeStore;
}

interface S3ProviderInternalOptions {
  bucket?: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  endpointUrl: URL;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedMultipartOptions;
  pathStyle: boolean;
  region: string;
  service: string;
  sessionToken?: SecretSource;
}

class S3Provider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: S3ProviderInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    if (profile.username === undefined || profile.password === undefined) {
      throw new ConfigurationError({
        message: "S3 provider requires username (access key id) and password (secret access key)",
        retryable: false,
      });
    }
    const accessKeyId = secretToString(await resolveSecret(profile.username));
    const secretAccessKey = secretToString(await resolveSecret(profile.password));
    const sessionToken =
      this.internals.sessionToken !== undefined
        ? secretToString(await resolveSecret(this.internals.sessionToken))
        : undefined;

    const bucket =
      profile.host !== undefined && profile.host !== "" ? profile.host : this.internals.bucket;
    if (bucket === undefined || bucket === "") {
      throw new ConfigurationError({
        message:
          "S3 provider requires a bucket via S3ProviderOptions.bucket or ConnectionProfile.host",
        retryable: false,
      });
    }

    const sessionOptions: S3SessionOptions = {
      accessKeyId,
      bucket,
      capabilities: this.internals.capabilities,
      defaultHeaders: this.internals.defaultHeaders,
      endpointUrl: this.internals.endpointUrl,
      fetch: this.internals.fetch,
      id: this.internals.id,
      multipart: this.internals.multipart,
      pathStyle: this.internals.pathStyle,
      region: this.internals.region,
      secretAccessKey,
      service: this.internals.service,
    };
    if (sessionToken !== undefined) sessionOptions.sessionToken = sessionToken;
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new S3Session(sessionOptions);
  }
}

interface S3SessionOptions {
  accessKeyId: string;
  bucket: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  endpointUrl: URL;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedMultipartOptions;
  pathStyle: boolean;
  region: string;
  secretAccessKey: string;
  service: string;
  sessionToken?: string;
  timeoutMs?: number;
}

class S3Session implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: S3SessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new S3FileSystem(options);
    this.transfers = new S3TransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class S3FileSystem implements RemoteFileSystem {
  constructor(private readonly options: S3SessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const prefix = normalized === "/" ? "" : `${normalized.slice(1)}/`;
    const url = buildBucketUrl(this.options);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("delimiter", "/");
    if (prefix.length > 0) url.searchParams.set("prefix", prefix);

    const response = await s3Fetch(this.options, "GET", url);
    if (!response.ok) throw await mapResponseErrorWithBody(response, normalized);
    const body = await response.text();
    return parseListObjectsV2(body, prefix);
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = buildObjectUrl(this.options, normalized);
    const response = await s3Fetch(this.options, "HEAD", url);
    if (!response.ok) throw await mapResponseErrorWithBody(response, normalized);
    const stat: RemoteStat = {
      exists: true,
      name: basenameRemotePath(normalized),
      path: normalized,
      type: "file",
    };
    const contentLength = response.headers.get("content-length");
    if (contentLength !== null) {
      const size = Number.parseInt(contentLength, 10);
      if (Number.isFinite(size) && size >= 0) stat.size = size;
    }
    const lastModified = response.headers.get("last-modified");
    if (lastModified !== null) {
      const parsed = new Date(lastModified);
      if (!Number.isNaN(parsed.getTime())) stat.modifiedAt = parsed;
    }
    const etag = response.headers.get("etag");
    if (etag !== null) stat.uniqueId = etag;
    return stat;
  }
}

class S3TransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: S3SessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = buildObjectUrl(this.options, normalized);
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const response = await s3Fetch(this.options, "GET", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: headers,
    });
    if (!response.ok && response.status !== 206) {
      throw await mapResponseErrorWithBody(response, normalized);
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        message: `S3 response had no body for ${redactUrlForLogging(url)}`,
        retryable: true,
      });
    }
    const result: ProviderTransferReadResult = {
      content: webStreamToAsyncIterable(body),
    };
    const totalBytes = parseTotalBytes(response, request.range?.offset);
    if (totalBytes !== undefined) result.totalBytes = totalBytes;
    if (request.range?.offset !== undefined && request.range.offset > 0) {
      result.bytesRead = request.range.offset;
    }
    const etag = response.headers.get("etag");
    if (etag !== null) result.checksum = etag;
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const multipart = this.options.multipart;
    const offset = request.offset ?? 0;
    if (offset > 0) {
      const hasCheckpointState = request.checkpoint?.state?.kind === "parts";
      if (!multipart.enabled || (multipart.resumeStore === undefined && !hasCheckpointState)) {
        throw new UnsupportedFeatureError({
          details: { offset },
          message:
            "S3 provider requires multipart.enabled plus a resume checkpoint " +
            "(unified checkpoint store or legacy multipart.resumeStore) to resume an upload",
          retryable: false,
        });
      }
      return this.writeMultipart(request, normalized, offset);
    }
    if (multipart.enabled) {
      return this.writeMultipart(request, normalized, 0);
    }
    return this.writeSingleShot(request, normalized);
  }

  /**
   * Aborts the orphaned multipart upload referenced by an invalidated
   * checkpoint so its parts stop accruing storage costs.
   */
  async discardResumable(request: ProviderTransferDiscardRequest): Promise<void> {
    if (request.state.kind !== "parts") return;
    const normalized = normalizeRemotePath(request.endpoint.path);
    const objectUrl = buildObjectUrl(this.options, normalized);
    await abortMultipart(this.options, objectUrl, request.state.uploadToken);
  }

  /**
   * Single PUT upload used when multipart is disabled. Streams the body with
   * a declared `Content-Length` (signed as `UNSIGNED-PAYLOAD`) when the
   * caller knows the total size; S3 requires a length up front, so only
   * unknown-size payloads fall back to buffering the content in memory.
   */
  private async writeSingleShot(
    request: ProviderTransferWriteRequest,
    normalized: string,
  ): Promise<ProviderTransferWriteResult> {
    const url = buildObjectUrl(this.options, normalized);
    const totalBytes = request.totalBytes;
    if (typeof totalBytes !== "number" || totalBytes < 0) {
      const buffered = await collectChunks(request.content);
      return this.singleShotFromBuffer(request, normalized, buffered);
    }

    let bytesTransferred = 0;
    const stream = asyncIterableToReadableStream(request.content, (chunk) => {
      bytesTransferred += chunk.byteLength;
      request.reportProgress(bytesTransferred, totalBytes);
    });
    const response = await s3Fetch(this.options, "PUT", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: { "content-type": "application/octet-stream" },
      streamBody: { content: stream, contentLength: totalBytes },
    });
    if (!response.ok) throw await mapResponseErrorWithBody(response, normalized);
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      totalBytes,
    };
    const etag = response.headers.get("etag");
    if (etag !== null) result.checksum = etag;
    return result;
  }

  private async writeMultipart(
    request: ProviderTransferWriteRequest,
    normalized: string,
    requestedOffset: number,
  ): Promise<ProviderTransferWriteResult> {
    const multipart = this.options.multipart;
    const objectUrl = buildObjectUrl(this.options, normalized);
    const checkpoint = request.checkpoint;
    const resumeStore = multipart.resumeStore;
    const resumeKey: S3MultipartResumeKey = {
      bucket: this.options.bucket,
      jobId: request.job.id,
      path: normalized,
    };

    // Resolve prior progress: the executor-managed checkpoint handle wins,
    // the legacy job-id-keyed store is the fallback.
    let resumeState: TransferPartsCheckpointState | undefined;
    if (checkpoint?.state?.kind === "parts") {
      resumeState = checkpoint.state;
    } else if (resumeStore !== undefined) {
      const legacy = (await resumeStore.load(resumeKey)) ?? undefined;
      if (legacy !== undefined) {
        resumeState = {
          committedBytes: legacy.parts[legacy.parts.length - 1]?.byteEnd ?? 0,
          kind: "parts",
          parts: legacy.parts.map((part) => ({
            byteEnd: part.byteEnd,
            partNumber: part.partNumber,
            token: part.etag,
          })),
          partSizeBytes: multipart.partSizeBytes,
          uploadToken: legacy.uploadId,
        };
      }
    }

    if (requestedOffset > 0) {
      if (resumeState === undefined) {
        throw new UnsupportedFeatureError({
          details: { offset: requestedOffset },
          message: "S3 provider has no resume checkpoint for this transfer",
          retryable: false,
        });
      }
      if (resumeState.committedBytes !== requestedOffset) {
        throw new UnsupportedFeatureError({
          details: { checkpointOffset: resumeState.committedBytes, requestedOffset },
          message: "S3 resume offset does not match the stored multipart checkpoint",
          retryable: false,
        });
      }
    } else if (resumeState !== undefined && resumeState.committedBytes > 0) {
      // The caller did not request a resume, so the source has not been
      // advanced: starting fresh is the only safe option.
      resumeState = undefined;
    }

    const partSize = resumeState?.partSizeBytes ?? multipart.partSizeBytes;
    const iterator = request.content[Symbol.asyncIterator]();

    // When starting fresh, buffer up to `thresholdBytes` so small payloads
    // can fall back to single-shot PUT. When resuming, the caller has already
    // advanced the source past `requestedOffset`.
    const initialChunks: Uint8Array[] = [];
    let initialSize = 0;
    if (resumeState === undefined) {
      while (initialSize <= multipart.thresholdBytes) {
        const next = await iterator.next();
        if (next.done === true) break;
        const chunk = next.value;
        if (chunk.byteLength === 0) continue;
        initialChunks.push(chunk);
        initialSize += chunk.byteLength;
      }
      if (initialSize <= multipart.thresholdBytes) {
        const buffered = concat(initialChunks, initialSize);
        return this.singleShotFromBuffer(request, normalized, buffered);
      }
    }

    // Completed parts in part-number order: the resumed prefix plus every
    // contiguous commit from the pool.
    const parts: S3MultipartPart[] = [];
    let uploadId: string;
    if (resumeState !== undefined) {
      uploadId = resumeState.uploadToken;
      for (const part of resumeState.parts) {
        if (part.token === undefined) {
          throw new UnsupportedFeatureError({
            details: { partNumber: part.partNumber },
            message: "S3 resume checkpoint is missing part ETags",
            retryable: false,
          });
        }
        parts.push({ byteEnd: part.byteEnd, etag: part.token, partNumber: part.partNumber });
      }
    } else {
      const initiateUrl = new URL(objectUrl.toString());
      initiateUrl.searchParams.set("uploads", "");
      const initiateResponse = await s3Fetch(this.options, "POST", initiateUrl, {
        ...(request.signal !== undefined ? { signal: request.signal } : {}),
        extraHeaders: { "content-type": "application/octet-stream" },
      });
      if (!initiateResponse.ok) throw await mapResponseErrorWithBody(initiateResponse, normalized);
      const initiateBody = await initiateResponse.text();
      const initiated = innerText(initiateBody, "UploadId");
      if (initiated === undefined || initiated === "") {
        throw new ConnectionError({
          message: "S3 CreateMultipartUpload returned no UploadId",
          retryable: true,
        });
      }
      uploadId = initiated;
    }

    const buildState = (): TransferPartsCheckpointState => ({
      committedBytes: parts[parts.length - 1]?.byteEnd ?? 0,
      kind: "parts",
      parts: parts.map((part) => ({
        byteEnd: part.byteEnd,
        partNumber: part.partNumber,
        token: part.etag,
      })),
      partSizeBytes: partSize,
      uploadToken: uploadId,
    });
    const saveProgress = async (): Promise<void> => {
      if (checkpoint !== undefined) await checkpoint.save(buildState());
      if (resumeStore !== undefined) {
        await resumeStore.save(resumeKey, {
          parts: parts.map((part) => ({ ...part })),
          uploadId,
        });
      }
    };
    if (resumeState === undefined) {
      // Persist the freshly created uploadId before any part flows so an
      // early crash leaves discoverable (and discardable) state.
      await saveProgress();
    }

    const startOffset = resumeState?.committedBytes ?? 0;
    const lastResumedPart = parts[parts.length - 1];
    const startPartNumber = lastResumedPart !== undefined ? lastResumedPart.partNumber + 1 : 1;
    let bytesTransferred = startOffset;

    const reader = createSequentialPartReader({
      initialChunks,
      partSizeBytes: partSize,
      source: { [Symbol.asyncIterator]: () => iterator },
      startOffset,
      startPartNumber,
    });

    try {
      await runMultipartUploadPool<string>({
        firstPartNumber: startPartNumber,
        onCommitted: async (part, committedBytes) => {
          parts.push({ byteEnd: part.byteEnd, etag: part.result, partNumber: part.partNumber });
          bytesTransferred = committedBytes;
          await saveProgress();
          request.reportProgress(committedBytes, request.totalBytes);
        },
        partConcurrency: multipart.partConcurrency,
        reader,
        throwIfAborted: () => {
          request.throwIfAborted();
        },
        uploadPart: async (part) => {
          const partUrl = new URL(objectUrl.toString());
          partUrl.searchParams.set("partNumber", String(part.partNumber));
          partUrl.searchParams.set("uploadId", uploadId);
          const partResponse = await s3Fetch(this.options, "PUT", partUrl, {
            ...(request.signal !== undefined ? { signal: request.signal } : {}),
            body: part.bytes,
          });
          if (!partResponse.ok) {
            throw await mapResponseErrorWithBody(partResponse, normalized);
          }
          const partEtag = partResponse.headers.get("etag");
          if (partEtag === null) {
            throw new ConnectionError({
              message: `S3 UploadPart returned no ETag for part ${String(part.partNumber)}`,
              retryable: true,
            });
          }
          return partEtag;
        },
      });
    } catch (error) {
      // With durable checkpoint state a future retry resumes this upload;
      // without one the orphaned multipart upload must be cleaned up now.
      if (resumeStore === undefined && checkpoint === undefined) {
        await abortMultipart(this.options, objectUrl, uploadId).catch(() => undefined);
      }
      throw error;
    }

    if (parts.length === 0) {
      if (resumeStore !== undefined) await resumeStore.clear(resumeKey);
      if (checkpoint !== undefined) await checkpoint.clear();
      await abortMultipart(this.options, objectUrl, uploadId).catch(() => undefined);
      throw new ConnectionError({
        message: "S3 multipart upload completed with zero parts",
        retryable: false,
      });
    }

    const completeUrl = new URL(objectUrl.toString());
    completeUrl.searchParams.set("uploadId", uploadId);
    const xmlBody = buildCompleteMultipartBody(parts);
    const completeResponse = await s3Fetch(this.options, "POST", completeUrl, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: new TextEncoder().encode(xmlBody),
      extraHeaders: { "content-type": "application/xml" },
    });
    if (!completeResponse.ok) {
      if (resumeStore === undefined && checkpoint === undefined) {
        await abortMultipart(this.options, objectUrl, uploadId).catch(() => undefined);
      }
      throw await mapResponseErrorWithBody(completeResponse, normalized);
    }
    // The unified checkpoint is cleared by the executor on success.
    if (resumeStore !== undefined) await resumeStore.clear(resumeKey);
    const completeBody = await completeResponse.text();
    const finalEtag = innerText(completeBody, "ETag");
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      totalBytes: bytesTransferred,
    };
    if (finalEtag !== undefined) result.checksum = finalEtag;
    return result;
  }

  private async singleShotFromBuffer(
    request: ProviderTransferWriteRequest,
    normalized: string,
    buffered: Uint8Array,
  ): Promise<ProviderTransferWriteResult> {
    const url = buildObjectUrl(this.options, normalized);
    const response = await s3Fetch(this.options, "PUT", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: { "content-type": "application/octet-stream" },
    });
    if (!response.ok) throw await mapResponseErrorWithBody(response, normalized);
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    const etag = response.headers.get("etag");
    if (etag !== null) result.checksum = etag;
    return result;
  }
}

interface S3FetchOptions {
  body?: Uint8Array;
  /**
   * Streamed request body with a declared length. Signed with
   * `UNSIGNED-PAYLOAD` because the bytes cannot be hashed before the request
   * starts; mutually exclusive with `body`.
   */
  streamBody?: { content: ReadableStream<Uint8Array>; contentLength: number };
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function s3Fetch(
  options: S3SessionOptions,
  method: string,
  url: URL,
  fetchOptions: S3FetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...options.defaultHeaders,
    ...(fetchOptions.extraHeaders ?? {}),
  };
  if (fetchOptions.body !== undefined) {
    headers["content-length"] = String(fetchOptions.body.byteLength);
  } else if (fetchOptions.streamBody !== undefined) {
    headers["content-length"] = String(fetchOptions.streamBody.contentLength);
  }
  signSigV4({
    accessKeyId: options.accessKeyId,
    headers,
    method,
    region: options.region,
    secretAccessKey: options.secretAccessKey,
    service: options.service,
    url,
    ...(fetchOptions.body !== undefined ? { body: fetchOptions.body } : {}),
    ...(fetchOptions.streamBody !== undefined ? { unsignedPayload: true } : {}),
    ...(options.sessionToken !== undefined ? { sessionToken: options.sessionToken } : {}),
  });

  // `duplex: "half"` is required by Node's fetch when the request body is a
  // ReadableStream so the runtime knows the request is fully written before
  // the response is read.
  const init: RequestInit & { duplex?: "half" } = { headers, method };
  if (fetchOptions.body !== undefined) {
    (init as { body: Uint8Array }).body = fetchOptions.body;
  } else if (fetchOptions.streamBody !== undefined) {
    (init as { body: ReadableStream<Uint8Array> }).body = fetchOptions.streamBody.content;
    init.duplex = "half";
  }
  if (fetchOptions.signal !== undefined) init.signal = fetchOptions.signal;

  const controller = new AbortController();
  const upstreamSignal = init.signal ?? null;
  if (upstreamSignal !== null) {
    if (upstreamSignal.aborted) controller.abort(upstreamSignal.reason);
    else upstreamSignal.addEventListener("abort", () => controller.abort(upstreamSignal.reason));
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
    timer = setTimeout(
      () => controller.abort(new Error("S3 request timed out")),
      options.timeoutMs,
    );
  }

  try {
    return await options.fetch(url.toString(), { ...init, signal: controller.signal });
  } catch (error) {
    const safeUrl = redactUrlForLogging(url);
    throw new ConnectionError({
      cause: error,
      details: { url: safeUrl },
      message: `S3 request to ${safeUrl} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function buildBucketUrl(options: S3SessionOptions): URL {
  const url = new URL(options.endpointUrl.toString());
  if (options.pathStyle) {
    url.pathname = `/${options.bucket}/`;
  } else {
    url.host = `${options.bucket}.${options.endpointUrl.host}`;
    url.pathname = "/";
  }
  return url;
}

function buildObjectUrl(options: S3SessionOptions, normalizedPath: string): URL {
  const key = normalizedPath === "/" ? "" : normalizedPath.slice(1);
  const url = buildBucketUrl(options);
  if (options.pathStyle) {
    url.pathname = `/${options.bucket}/${key}`;
  } else {
    url.pathname = `/${key}`;
  }
  return url;
}

async function collectChunks(source: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of source) {
    chunks.push(chunk);
    total += chunk.byteLength;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function concat(chunks: Uint8Array[], totalSize: number): Uint8Array {
  const out = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function abortMultipart(
  options: S3SessionOptions,
  objectUrl: URL,
  uploadId: string,
): Promise<void> {
  const url = new URL(objectUrl.toString());
  url.searchParams.set("uploadId", uploadId);
  await s3Fetch(options, "DELETE", url);
}

function buildCompleteMultipartBody(
  parts: ReadonlyArray<{ partNumber: number; etag: string }>,
): string {
  const partsXml = parts
    .map(
      (part) =>
        `<Part><PartNumber>${String(part.partNumber)}</PartNumber><ETag>${escapeXml(part.etag)}</ETag></Part>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload>${partsXml}</CompleteMultipartUpload>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseListObjectsV2(xml: string, prefix: string): RemoteEntry[] {
  const entries: RemoteEntry[] = [];
  const contentRegex = /<Contents\b[^>]*>([\s\S]*?)<\/Contents>/g;
  let match: RegExpExecArray | null;
  while ((match = contentRegex.exec(xml)) !== null) {
    const inner = match[1] ?? "";
    const key = innerText(inner, "Key");
    if (key === undefined || key === prefix) continue;
    const size = innerText(inner, "Size");
    const lastModified = innerText(inner, "LastModified");
    const etag = innerText(inner, "ETag");
    const relative = key.startsWith(prefix) ? key.slice(prefix.length) : key;
    if (relative === "") continue;
    const path = `/${key}`;
    const entry: RemoteEntry = {
      name: basenameRemotePath(path),
      path,
      type: "file",
    };
    if (size !== undefined) {
      const bytes = Number.parseInt(size, 10);
      if (Number.isFinite(bytes) && bytes >= 0) entry.size = bytes;
    }
    if (lastModified !== undefined) {
      const parsed = new Date(lastModified);
      if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
    }
    if (etag !== undefined) entry.uniqueId = etag;
    entries.push(entry);
  }

  const prefixRegex = /<CommonPrefixes\b[^>]*>([\s\S]*?)<\/CommonPrefixes>/g;
  while ((match = prefixRegex.exec(xml)) !== null) {
    const inner = match[1] ?? "";
    const subPrefix = innerText(inner, "Prefix");
    if (subPrefix === undefined) continue;
    const trimmed = subPrefix.endsWith("/") ? subPrefix.slice(0, -1) : subPrefix;
    const path = `/${trimmed}`;
    entries.push({
      name: basenameRemotePath(path),
      path,
      type: "directory",
    });
  }
  return entries;
}

function innerText(xml: string, tag: string): string | undefined {
  const pattern = new RegExp(`<${tag}\\b[^>]*?(?:/>|>([\\s\\S]*?)</${tag}>)`, "i");
  const match = pattern.exec(xml);
  if (match === null) return undefined;
  return (match[1] ?? "").trim();
}
