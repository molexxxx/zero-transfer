/**
 * S3-compatible provider.
 *
 * Talks to S3-compatible REST endpoints (AWS S3, MinIO, R2, Backblaze B2 S3
 * compatibility, Wasabi, etc.) with SigV4 signing. Supports `list` (ListObjectsV2),
 * `stat` (HEAD object), `read` (GET with optional `Range`), and single-shot `write`
 * (PUT object). Multipart upload remains a future capability.
 *
 * @module providers/web/S3Provider
 */
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import {
  ConfigurationError,
  ConnectionError,
  UnsupportedFeatureError,
} from "../../errors/ZeroTransferError";
import { resolveSecret, type SecretSource } from "../../profiles/SecretSource";
import type { ConnectionProfile, RemoteEntry, RemoteStat } from "../../types/public";
import { basenameRemotePath, normalizeRemotePath } from "../../utils/path";
import type { TransferProvider } from "../Provider";
import type { ProviderFactory } from "../ProviderFactory";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../ProviderTransferOperations";
import type { RemoteFileSystem } from "../RemoteFileSystem";
import { signSigV4 } from "./awsSigv4";
import {
  formatRangeHeader,
  mapResponseError,
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
  /** Multipart upload tuning. Disabled by default; enable for objects above ~5 GiB or when streaming. */
  multipart?: S3MultipartOptions;
}

/** Multipart upload tuning for the S3 provider. */
export interface S3MultipartOptions {
  /** Enable multipart upload. Defaults to `false`. */
  enabled?: boolean;
  /** Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. */
  thresholdBytes?: number;
  /** Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. */
  partSizeBytes?: number;
  /**
   * Optional persistent store enabling cross-process resume of incomplete
   * multipart uploads. When provided, in-flight `uploadId` plus uploaded part
   * etags are checkpointed after every part; on retry the upload reuses the
   * stored state and skips the bytes already transferred.
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

const DEFAULT_MULTIPART_PART_SIZE = 8 * 1024 * 1024;
const DEFAULT_MULTIPART_THRESHOLD = 8 * 1024 * 1024;

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

  const multipartEnabled = options.multipart?.enabled ?? false;
  const multipart: ResolvedMultipartOptions = {
    enabled: multipartEnabled,
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
          `S3 multipart upload enabled (partSize=${String(multipart.partSizeBytes)}B, threshold=${String(multipart.thresholdBytes)}B).`,
        ]
      : [
          "S3 provider performs single-shot PUT uploads; pass multipart.enabled to stream large objects.",
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
    if (!response.ok) throw mapResponseError(response, normalized);
    const body = await response.text();
    return parseListObjectsV2(body, prefix);
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = buildObjectUrl(this.options, normalized);
    const response = await s3Fetch(this.options, "HEAD", url);
    if (!response.ok) throw mapResponseError(response, normalized);
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
      throw mapResponseError(response, normalized);
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        message: `S3 response had no body for ${url.toString()}`,
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
      if (!multipart.enabled || multipart.resumeStore === undefined) {
        throw new UnsupportedFeatureError({
          details: { offset },
          message:
            "S3 provider requires multipart.enabled and multipart.resumeStore to resume an upload",
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

  private async writeSingleShot(
    request: ProviderTransferWriteRequest,
    normalized: string,
  ): Promise<ProviderTransferWriteResult> {
    const url = buildObjectUrl(this.options, normalized);
    const buffered = await collectChunks(request.content);
    const response = await s3Fetch(this.options, "PUT", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: { "content-type": "application/octet-stream" },
    });
    if (!response.ok) throw mapResponseError(response, normalized);
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
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
    const partSize = multipart.partSizeBytes;
    const objectUrl = buildObjectUrl(this.options, normalized);
    const resumeStore = multipart.resumeStore;
    const resumeKey: S3MultipartResumeKey = {
      bucket: this.options.bucket,
      jobId: request.job.id,
      path: normalized,
    };

    // Look up a checkpoint when a resume store is configured.
    let existing: S3MultipartCheckpoint | undefined;
    if (resumeStore !== undefined) {
      existing = (await resumeStore.load(resumeKey)) ?? undefined;
    }
    if (requestedOffset > 0) {
      if (existing === undefined) {
        throw new UnsupportedFeatureError({
          details: { offset: requestedOffset },
          message: "S3 provider has no resume checkpoint for this transfer",
          retryable: false,
        });
      }
      const lastByteEnd = existing.parts[existing.parts.length - 1]?.byteEnd ?? 0;
      if (lastByteEnd !== requestedOffset) {
        throw new UnsupportedFeatureError({
          details: { checkpointOffset: lastByteEnd, requestedOffset },
          message: "S3 resume offset does not match the stored multipart checkpoint",
          retryable: false,
        });
      }
    }

    const iterator = request.content[Symbol.asyncIterator]();

    // When resuming, we trust the caller has already advanced the source past
    // `requestedOffset`. When starting fresh, buffer up to `thresholdBytes` so
    // small payloads can fall back to single-shot PUT.
    const initialBuffer: Uint8Array[] = [];
    let initialSize = 0;
    if (existing === undefined) {
      while (initialSize <= multipart.thresholdBytes) {
        const next = await iterator.next();
        if (next.done === true) break;
        const chunk = next.value;
        if (chunk.byteLength === 0) continue;
        initialBuffer.push(chunk);
        initialSize += chunk.byteLength;
      }
      if (initialSize <= multipart.thresholdBytes) {
        const buffered = concat(initialBuffer, initialSize);
        return this.singleShotFromBuffer(request, normalized, buffered);
      }
    }

    // Establish (or reuse) the upload id.
    let uploadId: string;
    if (existing !== undefined) {
      uploadId = existing.uploadId;
    } else {
      const initiateUrl = new URL(objectUrl.toString());
      initiateUrl.searchParams.set("uploads", "");
      const initiateResponse = await s3Fetch(this.options, "POST", initiateUrl, {
        ...(request.signal !== undefined ? { signal: request.signal } : {}),
        extraHeaders: { "content-type": "application/octet-stream" },
      });
      if (!initiateResponse.ok) throw mapResponseError(initiateResponse, normalized);
      const initiateBody = await initiateResponse.text();
      const initiated = innerText(initiateBody, "UploadId");
      if (initiated === undefined || initiated === "") {
        throw new ConnectionError({
          message: "S3 CreateMultipartUpload returned no UploadId",
          retryable: true,
        });
      }
      uploadId = initiated;
      if (resumeStore !== undefined) {
        await resumeStore.save(resumeKey, { parts: [], uploadId });
      }
    }

    const parts: S3MultipartPart[] = existing !== undefined ? [...existing.parts] : [];
    const startedBytes = parts.length > 0 ? (parts[parts.length - 1]?.byteEnd ?? 0) : 0;
    let bytesTransferred = startedBytes;
    let partNumber = parts.length + 1;
    let buffer: Uint8Array[] = [];
    let bufferSize = 0;
    if (existing === undefined) {
      const trailing = concat(initialBuffer, initialSize);
      buffer = [trailing];
      bufferSize = trailing.byteLength;
    }

    const flushPart = async (final: boolean): Promise<void> => {
      while (bufferSize >= partSize || (final && bufferSize > 0)) {
        const take = final ? bufferSize : partSize;
        const partBytes = sliceFromBuffers(buffer, take);
        buffer = partBytes.remaining;
        bufferSize -= partBytes.bytes.byteLength;
        const partUrl = new URL(objectUrl.toString());
        partUrl.searchParams.set("partNumber", String(partNumber));
        partUrl.searchParams.set("uploadId", uploadId);
        const partResponse = await s3Fetch(this.options, "PUT", partUrl, {
          ...(request.signal !== undefined ? { signal: request.signal } : {}),
          body: partBytes.bytes,
        });
        if (!partResponse.ok) {
          throw mapResponseError(partResponse, normalized);
        }
        const partEtag = partResponse.headers.get("etag");
        if (partEtag === null) {
          throw new ConnectionError({
            message: `S3 UploadPart returned no ETag for part ${String(partNumber)}`,
            retryable: true,
          });
        }
        bytesTransferred += partBytes.bytes.byteLength;
        parts.push({ byteEnd: bytesTransferred, etag: partEtag, partNumber });
        if (resumeStore !== undefined) {
          await resumeStore.save(resumeKey, { parts: [...parts], uploadId });
        }
        request.reportProgress(bytesTransferred, undefined);
        partNumber += 1;
      }
    };

    try {
      await flushPart(false);
      while (true) {
        request.throwIfAborted();
        const next = await iterator.next();
        if (next.done === true) break;
        if (next.value.byteLength === 0) continue;
        buffer.push(next.value);
        bufferSize += next.value.byteLength;
        await flushPart(false);
      }
      await flushPart(true);
    } catch (error) {
      // When a resume store is wired the checkpoint is preserved so a future
      // retry can pick up where this one left off; otherwise we must clean up
      // the orphaned multipart upload immediately.
      if (resumeStore === undefined) {
        await abortMultipart(this.options, objectUrl, uploadId).catch(() => undefined);
      }
      throw error;
    }

    if (parts.length === 0) {
      if (resumeStore !== undefined) await resumeStore.clear(resumeKey);
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
      if (resumeStore === undefined) {
        await abortMultipart(this.options, objectUrl, uploadId).catch(() => undefined);
      }
      throw mapResponseError(completeResponse, normalized);
    }
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
    if (!response.ok) throw mapResponseError(response, normalized);
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
    ...(options.sessionToken !== undefined ? { sessionToken: options.sessionToken } : {}),
  });

  const init: RequestInit = { headers, method };
  if (fetchOptions.body !== undefined) (init as { body: Uint8Array }).body = fetchOptions.body;
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
    throw new ConnectionError({
      cause: error,
      details: { url: url.toString() },
      message: `S3 request to ${url.toString()} failed`,
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

function sliceFromBuffers(
  buffers: Uint8Array[],
  size: number,
): { bytes: Uint8Array; remaining: Uint8Array[] } {
  const out = new Uint8Array(size);
  let offset = 0;
  let i = 0;
  while (offset < size && i < buffers.length) {
    const chunk = buffers[i];
    if (chunk === undefined) {
      i += 1;
      continue;
    }
    const remaining = size - offset;
    if (chunk.byteLength <= remaining) {
      out.set(chunk, offset);
      offset += chunk.byteLength;
      i += 1;
    } else {
      out.set(chunk.subarray(0, remaining), offset);
      const leftover = chunk.subarray(remaining);
      const next = buffers.slice(i + 1);
      next.unshift(leftover);
      return { bytes: out, remaining: next };
    }
  }
  return { bytes: out.subarray(0, offset), remaining: buffers.slice(i) };
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
