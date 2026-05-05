/**
 * Google Cloud Storage object-store provider.
 *
 * Targets the GCS JSON API (`https://storage.googleapis.com/storage/v1/b/{bucket}/...`)
 * for listing/stat operations and the upload media endpoint
 * (`https://storage.googleapis.com/upload/storage/v1/b/{bucket}/o`) for
 * uploads. Authentication is via OAuth bearer token sourced from
 * `profile.password`.
 *
 * @module providers/cloud/GcsProvider
 */
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
} from "../../errors/ZeroTransferError";
import { resolveSecret } from "../../profiles/SecretSource";
import type { ConnectionProfile, RemoteEntry, RemoteStat } from "../../types/public";
import { normalizeRemotePath } from "../../utils/path";
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
import {
  formatRangeHeader,
  parseTotalBytes,
  secretToString,
  webStreamToAsyncIterable,
  type HttpFetch,
} from "../web/httpInternals";

export type { HttpFetch };

const GCS_JSON_API_BASE = "https://storage.googleapis.com/storage/v1";
const GCS_UPLOAD_API_BASE = "https://storage.googleapis.com/upload/storage/v1";
const GCS_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["md5", "crc32c"];
const GCS_CHUNK_ALIGNMENT = 256 * 1024;
const DEFAULT_GCS_PART_SIZE = 8 * 1024 * 1024;
const DEFAULT_GCS_THRESHOLD = 8 * 1024 * 1024;

/** Options accepted by {@link createGcsProviderFactory}. */
export interface GcsProviderOptions {
  /** Provider id to register. Defaults to `"gcs"`. */
  id?: ProviderId;
  /** Bucket name. Required. */
  bucket: string;
  /** Override the JSON API base URL. */
  apiBaseUrl?: string;
  /** Override the upload API base URL. */
  uploadBaseUrl?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied before bearer auth on every request. */
  defaultHeaders?: Record<string, string>;
  /** Resumable upload session tuning. Enabled by default. */
  multipart?: GcsMultipartOptions;
}

/** Resumable-upload session tuning for the GCS provider. */
export interface GcsMultipartOptions {
  /**
   * Enable resumable upload sessions. **Defaults to `true`** so payloads above
   * {@link GcsMultipartOptions.thresholdBytes} stream in fixed-size chunks via
   * the resumable session endpoint instead of being buffered into a single
   * `uploadType=media` POST. Set to `false` to force the legacy single-shot
   * behaviour.
   */
  enabled?: boolean;
  /** Object size threshold above which a resumable session is used. Defaults to 8 MiB. */
  thresholdBytes?: number;
  /**
   * Target chunk size in bytes. Must be a multiple of 256 KiB per the GCS
   * protocol (the final chunk is exempt). Defaults to 8 MiB.
   */
  partSizeBytes?: number;
}

interface ResolvedGcsMultipartOptions {
  enabled: boolean;
  thresholdBytes: number;
  partSizeBytes: number;
}

/**
 * Creates a Google Cloud Storage provider factory.
 *
 * Authentication is per-connection: pass a Google OAuth 2 access token via
 * `profile.password`. `profile.host` is unused - the bucket is fixed at
 * factory construction time so a single client can target multiple buckets
 * by registering separate factories.
 *
 * @param options - Bucket plus optional fetch/transport overrides.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example Bearer-token upload
 * ```ts
 * import { createGcsProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createGcsProviderFactory({ bucket: "my-bucket" })],
 * });
 *
 * await uploadFile({
 *   client,
 *   localPath: "./build/app.tar.gz",
 *   destination: {
 *     path: "releases/2026.04/app.tar.gz",
 *     profile: {
 *       host: "my-bucket",
 *       provider: "gcs",
 *       password: { env: "GCP_OAUTH_ACCESS_TOKEN" },
 *     },
 *   },
 * });
 * ```
 */
export function createGcsProviderFactory(options: GcsProviderOptions): ProviderFactory {
  if (typeof options.bucket !== "string" || options.bucket === "") {
    throw new ConfigurationError({
      message: "GcsProviderOptions.bucket is required",
      retryable: false,
    });
  }
  const id: ProviderId = options.id ?? "gcs";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply GcsProviderOptions.fetch explicitly",
      retryable: false,
    });
  }
  const apiBaseUrl = (options.apiBaseUrl ?? GCS_JSON_API_BASE).replace(/\/+$/u, "");
  const uploadBaseUrl = (options.uploadBaseUrl ?? GCS_UPLOAD_API_BASE).replace(/\/+$/u, "");
  const multipartEnabled = options.multipart?.enabled ?? true;
  const partSizeBytes = options.multipart?.partSizeBytes ?? DEFAULT_GCS_PART_SIZE;
  const thresholdBytes = options.multipart?.thresholdBytes ?? DEFAULT_GCS_THRESHOLD;
  if (multipartEnabled) {
    if (!Number.isInteger(partSizeBytes) || partSizeBytes <= 0) {
      throw new ConfigurationError({
        details: { partSizeBytes },
        message: "GcsMultipartOptions.partSizeBytes must be a positive integer",
        retryable: false,
      });
    }
    if (partSizeBytes % GCS_CHUNK_ALIGNMENT !== 0) {
      throw new ConfigurationError({
        details: { partSizeBytes },
        message: `GCS multipart partSizeBytes must be a multiple of ${String(GCS_CHUNK_ALIGNMENT)} bytes (256 KiB)`,
        retryable: false,
      });
    }
    if (!Number.isInteger(thresholdBytes) || thresholdBytes < 0) {
      throw new ConfigurationError({
        details: { thresholdBytes },
        message: "GcsMultipartOptions.thresholdBytes must be a non-negative integer",
        retryable: false,
      });
    }
  }
  const multipart: ResolvedGcsMultipartOptions = {
    enabled: multipartEnabled,
    partSizeBytes,
    thresholdBytes,
  };

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["token", "oauth"],
    checksum: [...GCS_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 4,
    metadata: ["modifiedAt", "createdAt", "uniqueId"],
    notes: multipartEnabled
      ? [
          `GCS resumable-upload session enabled by default (partSize=${String(multipart.partSizeBytes)}B, threshold=${String(multipart.thresholdBytes)}B).`,
          "Payloads at or below the threshold automatically fall back to single-shot uploadType=media POST.",
          "Pass `multipart: { enabled: false }` to force the legacy single-shot behaviour.",
        ]
      : [
          "GCS provider performs single-shot media uploads via /upload?uploadType=media; resumable upload sessions are disabled.",
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
      new GcsProvider({
        apiBaseUrl,
        bucket: options.bucket,
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        fetch: fetchImpl,
        id,
        multipart,
        uploadBaseUrl,
      }),
    id,
  };
}

interface GcsInternalOptions {
  apiBaseUrl: string;
  bucket: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedGcsMultipartOptions;
  uploadBaseUrl: string;
}

class GcsProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: GcsInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    if (profile.password === undefined) {
      throw new ConfigurationError({
        message: "GCS provider requires a bearer token via profile.password",
        retryable: false,
      });
    }
    const token = secretToString(await resolveSecret(profile.password));
    if (token === "") {
      throw new ConfigurationError({
        message: "GCS bearer token resolved to an empty string",
        retryable: false,
      });
    }
    const sessionOptions: GcsSessionOptions = {
      apiBaseUrl: this.internals.apiBaseUrl,
      bucket: this.internals.bucket,
      capabilities: this.internals.capabilities,
      defaultHeaders: this.internals.defaultHeaders,
      fetch: this.internals.fetch,
      id: this.internals.id,
      multipart: this.internals.multipart,
      token,
      uploadBaseUrl: this.internals.uploadBaseUrl,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new GcsSession(sessionOptions);
  }
}

interface GcsSessionOptions {
  apiBaseUrl: string;
  bucket: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedGcsMultipartOptions;
  timeoutMs?: number;
  token: string;
  uploadBaseUrl: string;
}

class GcsSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: GcsSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new GcsFileSystem(options);
    this.transfers = new GcsTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

interface GcsObject {
  name: string;
  size?: string;
  md5Hash?: string;
  crc32c?: string;
  etag?: string;
  updated?: string;
  timeCreated?: string;
  contentType?: string;
}

interface GcsObjectsListResponse {
  items?: GcsObject[];
  prefixes?: string[];
  nextPageToken?: string;
}

class GcsFileSystem implements RemoteFileSystem {
  constructor(private readonly options: GcsSessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const prefix = toGcsPrefix(normalized);
    const entries: RemoteEntry[] = [];
    let pageToken: string | undefined;
    do {
      const params: Record<string, string> = { delimiter: "/" };
      if (prefix !== "") params["prefix"] = prefix;
      if (pageToken !== undefined) params["pageToken"] = pageToken;
      const url = `${this.options.apiBaseUrl}/b/${encodeURIComponent(this.options.bucket)}/o?${buildSearch(params)}`;
      const response = await gcsFetch(this.options, "GET", url);
      if (!response.ok) {
        throw mapGcsResponseError(response, normalized, await safeReadText(response));
      }
      const parsed = (await response.json()) as GcsObjectsListResponse;
      for (const item of parsed.items ?? []) {
        const entry = objectToEntry(item, prefix, normalized);
        if (entry !== undefined) entries.push(entry);
      }
      for (const dirPrefix of parsed.prefixes ?? []) {
        const entry = prefixToEntry(dirPrefix, prefix, normalized);
        if (entry !== undefined) entries.push(entry);
      }
      pageToken = parsed.nextPageToken;
    } while (pageToken !== undefined);
    return entries;
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const objectName = toGcsObjectName(normalized);
    const url = `${this.options.apiBaseUrl}/b/${encodeURIComponent(this.options.bucket)}/o/${encodeURIComponent(objectName)}`;
    const response = await gcsFetch(this.options, "GET", url);
    if (!response.ok) {
      throw mapGcsResponseError(response, normalized, await safeReadText(response));
    }
    const item = (await response.json()) as GcsObject;
    const parent = parentDir(normalized);
    const entry = objectToEntry(item, toGcsPrefix(parent), parent);
    if (entry === undefined) {
      throw new PathNotFoundError({
        details: { path: normalized },
        message: `GCS path not found: ${normalized}`,
        retryable: false,
      });
    }
    return { ...entry, exists: true };
  }
}

class GcsTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: GcsSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const objectName = toGcsObjectName(normalized);
    const url = `${this.options.apiBaseUrl}/b/${encodeURIComponent(this.options.bucket)}/o/${encodeURIComponent(objectName)}?alt=media`;
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const response = await gcsFetch(this.options, "GET", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: headers,
    });
    if (!response.ok && response.status !== 206) {
      throw mapGcsResponseError(response, normalized, await safeReadText(response));
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        details: { path: normalized },
        message: `GCS download for ${normalized} produced no body`,
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
    const md5 = response.headers.get("x-goog-hash") ?? response.headers.get("content-md5");
    if (md5 !== null && md5 !== "") result.checksum = md5;
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "GCS provider does not yet support cross-attempt resume of upload sessions",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const objectName = toGcsObjectName(normalized);
    const multipart = this.options.multipart;
    if (!multipart.enabled) {
      const buffered = await collectChunks(request.content);
      return this.singleShotMedia(request, normalized, objectName, buffered);
    }
    return this.writeResumableSession(request, normalized, objectName);
  }

  private async singleShotMedia(
    request: ProviderTransferWriteRequest,
    normalized: string,
    objectName: string,
    buffered: Uint8Array,
  ): Promise<ProviderTransferWriteResult> {
    const url = `${this.options.uploadBaseUrl}/b/${encodeURIComponent(this.options.bucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
    const response = await gcsFetch(this.options, "POST", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: { "content-type": "application/octet-stream" },
    });
    if (!response.ok) {
      throw mapGcsResponseError(response, normalized, await safeReadText(response));
    }
    const item = (await response.json()) as GcsObject;
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    if (typeof item.md5Hash === "string" && item.md5Hash !== "") result.checksum = item.md5Hash;
    return result;
  }

  private async writeResumableSession(
    request: ProviderTransferWriteRequest,
    normalized: string,
    objectName: string,
  ): Promise<ProviderTransferWriteResult> {
    const multipart = this.options.multipart;
    const partSize = multipart.partSizeBytes;
    const iterator = request.content[Symbol.asyncIterator]();

    // Buffer up to thresholdBytes so small payloads fall back to single-shot.
    const initialBuffer: Uint8Array[] = [];
    let initialSize = 0;
    while (initialSize <= multipart.thresholdBytes) {
      const next = await iterator.next();
      if (next.done === true) break;
      const chunk = next.value;
      if (chunk.byteLength === 0) continue;
      initialBuffer.push(chunk);
      initialSize += chunk.byteLength;
    }
    if (initialSize <= multipart.thresholdBytes) {
      return this.singleShotMedia(
        request,
        normalized,
        objectName,
        concatChunks(initialBuffer, initialSize),
      );
    }

    // Initiate resumable session.
    const initiateUrl = `${this.options.uploadBaseUrl}/b/${encodeURIComponent(this.options.bucket)}/o?uploadType=resumable&name=${encodeURIComponent(objectName)}`;
    const initiateResponse = await gcsFetch(this.options, "POST", initiateUrl, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: new TextEncoder().encode("{}"),
      extraHeaders: {
        "content-type": "application/json; charset=UTF-8",
        "x-upload-content-type": "application/octet-stream",
      },
    });
    if (!initiateResponse.ok) {
      throw mapGcsResponseError(initiateResponse, normalized, await safeReadText(initiateResponse));
    }
    const sessionUri = initiateResponse.headers.get("location");
    if (sessionUri === null || sessionUri === "") {
      throw new ConnectionError({
        details: { path: normalized },
        message: "GCS resumable session initiation returned no Location header",
        retryable: true,
      });
    }

    let bytesTransferred = 0;
    let buffer: Uint8Array[] = [...initialBuffer];
    let bufferSize = initialSize;
    let sourceExhausted = false;
    let finalItem: GcsObject | undefined;

    const flushChunks = async (final: boolean): Promise<void> => {
      while (bufferSize >= partSize || (final && bufferSize > 0)) {
        const take = final ? bufferSize : partSize;
        const sliced = sliceFromBuffers(buffer, take);
        buffer = sliced.remaining;
        bufferSize -= sliced.bytes.byteLength;
        const chunkStart = bytesTransferred;
        const chunkEnd = chunkStart + sliced.bytes.byteLength - 1;
        const totalRange = final ? String(chunkEnd + 1) : "*";
        const headers: Record<string, string> = {
          "content-length": String(sliced.bytes.byteLength),
          "content-range": `bytes ${String(chunkStart)}-${String(chunkEnd)}/${totalRange}`,
          "content-type": "application/octet-stream",
        };
        const response = await gcsSessionFetch(this.options, sessionUri, {
          ...(request.signal !== undefined ? { signal: request.signal } : {}),
          body: sliced.bytes,
          extraHeaders: headers,
        });
        if (response.status === 308) {
          // Resume Incomplete - server accepted bytes; continue.
          bytesTransferred += sliced.bytes.byteLength;
          request.reportProgress(bytesTransferred, undefined);
          continue;
        }
        if (response.status === 200 || response.status === 201) {
          bytesTransferred += sliced.bytes.byteLength;
          request.reportProgress(bytesTransferred, bytesTransferred);
          finalItem = (await response.json()) as GcsObject;
          return;
        }
        throw mapGcsResponseError(response, normalized, await safeReadText(response));
      }
    };

    try {
      await flushChunks(false);
      while (!sourceExhausted) {
        request.throwIfAborted();
        const next = await iterator.next();
        if (next.done === true) {
          sourceExhausted = true;
          break;
        }
        if (next.value.byteLength === 0) continue;
        buffer.push(next.value);
        bufferSize += next.value.byteLength;
        await flushChunks(false);
        if (finalItem !== undefined) break;
      }
      if (finalItem === undefined) {
        await flushChunks(true);
      }
    } catch (error) {
      // Best-effort abort: DELETE the session URI cancels an in-flight upload.
      void gcsSessionFetch(this.options, sessionUri, { method: "DELETE" }).catch(() => undefined);
      throw error;
    }

    if (finalItem === undefined) {
      throw new ConnectionError({
        details: { path: normalized },
        message: "GCS resumable upload did not return a final object",
        retryable: true,
      });
    }
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      totalBytes: bytesTransferred,
    };
    if (typeof finalItem.md5Hash === "string" && finalItem.md5Hash !== "") {
      result.checksum = finalItem.md5Hash;
    }
    return result;
  }
}

interface GcsFetchOptions {
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function gcsFetch(
  options: GcsSessionOptions,
  method: string,
  url: string,
  fetchOptions: GcsFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...options.defaultHeaders,
    ...(fetchOptions.extraHeaders ?? {}),
    authorization: `Bearer ${options.token}`,
  };
  const init: RequestInit = { headers, method };
  if (fetchOptions.body !== undefined) {
    (init as { body: Uint8Array }).body = fetchOptions.body;
  }
  const controller = new AbortController();
  const upstream = fetchOptions.signal ?? null;
  if (upstream !== null) {
    if (upstream.aborted) controller.abort(upstream.reason);
    else upstream.addEventListener("abort", () => controller.abort(upstream.reason));
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
    timer = setTimeout(
      () => controller.abort(new Error("GCS request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ConnectionError({
      cause: error,
      details: { url },
      message: `GCS request to ${url} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function objectToEntry(item: GcsObject, prefix: string, parent: string): RemoteEntry | undefined {
  const tail = item.name.startsWith(prefix) ? item.name.slice(prefix.length) : item.name;
  if (tail === "" || tail.includes("/")) return undefined;
  const entry: RemoteEntry = {
    name: tail,
    path: joinPath(parent, tail),
    raw: item,
    type: "file",
    uniqueId: item.etag ?? item.md5Hash ?? item.name,
  };
  if (typeof item.size === "string") {
    const sized = Number(item.size);
    if (Number.isFinite(sized)) entry.size = sized;
  }
  if (typeof item.updated === "string") {
    const parsed = new Date(item.updated);
    if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
  }
  if (typeof item.timeCreated === "string") {
    const parsed = new Date(item.timeCreated);
    if (!Number.isNaN(parsed.getTime())) entry.createdAt = parsed;
  }
  return entry;
}

function prefixToEntry(
  prefixedName: string,
  prefix: string,
  parent: string,
): RemoteEntry | undefined {
  const tail = prefixedName.slice(prefix.length).replace(/\/+$/u, "");
  if (tail === "" || tail.includes("/")) return undefined;
  return {
    name: tail,
    path: joinPath(parent, tail),
    type: "directory",
    uniqueId: prefixedName,
  };
}

function toGcsPrefix(normalized: string): string {
  if (normalized === "/" || normalized === "") return "";
  const trimmed = normalized.replace(/^\/+/u, "");
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function toGcsObjectName(normalized: string): string {
  return normalized.replace(/^\/+/u, "");
}

function parentDir(normalized: string): string {
  if (normalized === "/" || normalized === "") return "/";
  const idx = normalized.lastIndexOf("/");
  if (idx <= 0) return "/";
  return normalized.slice(0, idx);
}

function joinPath(parent: string, name: string): string {
  if (parent === "" || parent === "/") return `/${name}`;
  return parent.endsWith("/") ? `${parent}${name}` : `${parent}/${name}`;
}

function buildSearch(params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) search.set(k, v);
  return search.toString();
}

function mapGcsResponseError(response: Response, contextPath: string, bodyText: string): Error {
  const details = {
    bodyText: bodyText.slice(0, 500),
    path: contextPath,
    status: response.status,
    statusText: response.statusText,
  };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `GCS authentication failed for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `GCS access forbidden for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `GCS path not found: ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 429) {
    return new ConnectionError({
      details,
      message: `GCS rate limit hit for ${contextPath}`,
      retryable: true,
    });
  }
  return new ConnectionError({
    details,
    message: `GCS request for ${contextPath} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
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

function concatChunks(chunks: Uint8Array[], totalSize: number): Uint8Array {
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

interface GcsSessionFetchOptions {
  method?: string;
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function gcsSessionFetch(
  options: GcsSessionOptions,
  sessionUri: string,
  fetchOptions: GcsSessionFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...options.defaultHeaders,
    ...(fetchOptions.extraHeaders ?? {}),
    authorization: `Bearer ${options.token}`,
  };
  const init: RequestInit = { headers, method: fetchOptions.method ?? "PUT" };
  if (fetchOptions.body !== undefined) {
    (init as { body: Uint8Array }).body = fetchOptions.body;
  }
  const controller = new AbortController();
  const upstream = fetchOptions.signal ?? null;
  if (upstream !== null) {
    if (upstream.aborted) controller.abort(upstream.reason);
    else upstream.addEventListener("abort", () => controller.abort(upstream.reason));
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
    timer = setTimeout(
      () => controller.abort(new Error("GCS resumable session request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(sessionUri, { ...init, signal: controller.signal });
  } catch (error) {
    const safeUrl = redactSessionUrl(sessionUri);
    throw new ConnectionError({
      cause: error,
      details: { url: safeUrl },
      message: `GCS resumable session request to ${safeUrl} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Strips the query string from a pre-signed session URI before logging it,
 * since the query commonly carries upload-session credentials.
 */
function redactSessionUrl(url: string): string {
  const queryStart = url.indexOf("?");
  return queryStart === -1 ? url : `${url.slice(0, queryStart)}?<redacted>`;
}
