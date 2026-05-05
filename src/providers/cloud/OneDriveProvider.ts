/**
 * Microsoft OneDrive / SharePoint cloud-drive provider.
 *
 * Talks to the Microsoft Graph v1.0 API. The provider is path-addressed
 * (`/drive/root:/path/to/file`) and uses a bearer token sourced from
 * `profile.password` (resolved as a `SecretSource`). The drive root can be
 * scoped via {@link OneDriveProviderOptions.driveBaseUrl} - the default is
 * `https://graph.microsoft.com/v1.0/me/drive`, which targets the signed-in
 * user's OneDrive. SharePoint document libraries are addressed by overriding
 * `driveBaseUrl` to `https://graph.microsoft.com/v1.0/drives/{driveId}` or
 * `/sites/{siteId}/drives/{driveId}`.
 *
 * @module providers/cloud/OneDriveProvider
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

const ONEDRIVE_DRIVE_BASE = "https://graph.microsoft.com/v1.0/me/drive";
const ONEDRIVE_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["sha1", "sha256", "quickxorhash"];
const ONEDRIVE_CHUNK_ALIGNMENT = 320 * 1024;
const DEFAULT_ONEDRIVE_PART_SIZE = 10 * 1024 * 1024;
const DEFAULT_ONEDRIVE_THRESHOLD = 4 * 1024 * 1024;

/** Options accepted by {@link createOneDriveProviderFactory}. */
export interface OneDriveProviderOptions {
  /** Provider id to register. Defaults to `"one-drive"`. */
  id?: ProviderId;
  /**
   * Drive root URL used as the prefix for every Graph call. Defaults to
   * `https://graph.microsoft.com/v1.0/me/drive`. Override with a SharePoint
   * drive URL like `https://graph.microsoft.com/v1.0/drives/{driveId}`.
   */
  driveBaseUrl?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied before bearer auth on every request. */
  defaultHeaders?: Record<string, string>;
  /** Resumable upload session tuning. Enabled by default. */
  multipart?: OneDriveMultipartOptions;
}

/** Resumable-upload session tuning for the OneDrive provider. */
export interface OneDriveMultipartOptions {
  /**
   * Enable Microsoft Graph upload sessions. **Defaults to `true`** so payloads
   * above {@link OneDriveMultipartOptions.thresholdBytes} stream in fixed-size
   * chunks via `createUploadSession` instead of being buffered into a single
   * `PUT /content`. Set to `false` to force the legacy single-shot behaviour.
   */
  enabled?: boolean;
  /** Object size threshold above which an upload session is used. Defaults to 4 MiB. */
  thresholdBytes?: number;
  /**
   * Target chunk size in bytes. Must be a multiple of 320 KiB per the Graph
   * protocol (the final chunk is exempt). Defaults to 10 MiB.
   */
  partSizeBytes?: number;
}

interface ResolvedOneDriveMultipartOptions {
  enabled: boolean;
  thresholdBytes: number;
  partSizeBytes: number;
}

/**
 * Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph.
 *
 * The bearer token is resolved per-connection from `profile.password`.
 * `profile.host` is unused. To target a SharePoint site or specific drive,
 * override `driveBaseUrl` with `https://graph.microsoft.com/v1.0/drives/{driveId}`.
 *
 * @param options - Optional `driveBaseUrl`, `fetch`, and default headers.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example Upload to the authenticated user's OneDrive
 * ```ts
 * import { createOneDriveProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createOneDriveProviderFactory()],
 * });
 *
 * await uploadFile({
 *   client,
 *   localPath: "./report.xlsx",
 *   destination: {
 *     path: "/Reports/Q2/report.xlsx",
 *     profile: {
 *       host: "",
 *       provider: "one-drive",
 *       password: { env: "GRAPH_ACCESS_TOKEN" },
 *     },
 *   },
 * });
 * ```
 *
 * @example Target a specific SharePoint drive
 * ```ts
 * createOneDriveProviderFactory({
 *   driveBaseUrl: "https://graph.microsoft.com/v1.0/drives/b!abc123",
 * });
 * ```
 */
export function createOneDriveProviderFactory(
  options: OneDriveProviderOptions = {},
): ProviderFactory {
  const id: ProviderId = options.id ?? "one-drive";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const driveBaseUrl = (options.driveBaseUrl ?? ONEDRIVE_DRIVE_BASE).replace(/\/+$/u, "");

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply OneDriveProviderOptions.fetch explicitly",
      retryable: false,
    });
  }

  const multipartEnabled = options.multipart?.enabled ?? true;
  const partSizeBytes = options.multipart?.partSizeBytes ?? DEFAULT_ONEDRIVE_PART_SIZE;
  const thresholdBytes = options.multipart?.thresholdBytes ?? DEFAULT_ONEDRIVE_THRESHOLD;
  if (multipartEnabled) {
    if (!Number.isInteger(partSizeBytes) || partSizeBytes <= 0) {
      throw new ConfigurationError({
        details: { partSizeBytes },
        message: "OneDriveMultipartOptions.partSizeBytes must be a positive integer",
        retryable: false,
      });
    }
    if (partSizeBytes % ONEDRIVE_CHUNK_ALIGNMENT !== 0) {
      throw new ConfigurationError({
        details: { partSizeBytes },
        message: `OneDrive multipart partSizeBytes must be a multiple of ${String(ONEDRIVE_CHUNK_ALIGNMENT)} bytes (320 KiB)`,
        retryable: false,
      });
    }
    if (!Number.isInteger(thresholdBytes) || thresholdBytes < 0) {
      throw new ConfigurationError({
        details: { thresholdBytes },
        message: "OneDriveMultipartOptions.thresholdBytes must be a non-negative integer",
        retryable: false,
      });
    }
  }
  const multipart: ResolvedOneDriveMultipartOptions = {
    enabled: multipartEnabled,
    partSizeBytes,
    thresholdBytes,
  };

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["token", "oauth"],
    checksum: [...ONEDRIVE_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 4,
    metadata: ["modifiedAt", "createdAt", "uniqueId"],
    notes: multipartEnabled
      ? [
          `OneDrive upload session enabled by default (partSize=${String(multipart.partSizeBytes)}B, threshold=${String(multipart.thresholdBytes)}B).`,
          "Payloads at or below the threshold automatically fall back to single-shot PUT /content.",
          "Pass `multipart: { enabled: false }` to force the legacy single-shot behaviour.",
        ]
      : [
          "OneDrive provider performs single-shot uploads via PUT /content; resumable upload sessions are disabled.",
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
      new OneDriveProvider({
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        driveBaseUrl,
        fetch: fetchImpl,
        id,
        multipart,
      }),
    id,
  };
}

interface OneDriveInternalOptions {
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  driveBaseUrl: string;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedOneDriveMultipartOptions;
}

class OneDriveProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: OneDriveInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    if (profile.password === undefined) {
      throw new ConfigurationError({
        message: "OneDrive provider requires a bearer token via profile.password",
        retryable: false,
      });
    }
    const token = secretToString(await resolveSecret(profile.password));
    if (token === "") {
      throw new ConfigurationError({
        message: "OneDrive bearer token resolved to an empty string",
        retryable: false,
      });
    }
    const sessionOptions: OneDriveSessionOptions = {
      capabilities: this.internals.capabilities,
      defaultHeaders: this.internals.defaultHeaders,
      driveBaseUrl: this.internals.driveBaseUrl,
      fetch: this.internals.fetch,
      id: this.internals.id,
      multipart: this.internals.multipart,
      token,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new OneDriveSession(sessionOptions);
  }
}

interface OneDriveSessionOptions {
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  driveBaseUrl: string;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedOneDriveMultipartOptions;
  timeoutMs?: number;
  token: string;
}

class OneDriveSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: OneDriveSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new OneDriveFileSystem(options);
    this.transfers = new OneDriveTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

interface DriveItemHashes {
  sha1Hash?: string;
  sha256Hash?: string;
  quickXorHash?: string;
}

interface DriveItemFile {
  hashes?: DriveItemHashes;
  mimeType?: string;
}

interface DriveItem {
  id: string;
  name: string;
  size?: number;
  lastModifiedDateTime?: string;
  createdDateTime?: string;
  parentReference?: { path?: string };
  file?: DriveItemFile;
  folder?: { childCount?: number };
  eTag?: string;
}

interface DriveChildrenResponse {
  value: DriveItem[];
  "@odata.nextLink"?: string;
}

class OneDriveFileSystem implements RemoteFileSystem {
  constructor(private readonly options: OneDriveSessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const initial = `${this.options.driveBaseUrl}${itemChildrenSegment(normalized)}`;
    const entries: RemoteEntry[] = [];
    let nextUrl: string | undefined = initial;
    while (nextUrl !== undefined) {
      const response = await graphFetch(this.options, "GET", nextUrl);
      if (!response.ok) {
        throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
      }
      const parsed = (await response.json()) as DriveChildrenResponse;
      for (const item of parsed.value) {
        entries.push(toRemoteEntry(item, normalized));
      }
      nextUrl = parsed["@odata.nextLink"];
    }
    return entries;
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = `${this.options.driveBaseUrl}${itemSegment(normalized)}`;
    const response = await graphFetch(this.options, "GET", url);
    if (!response.ok) {
      throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
    }
    const item = (await response.json()) as DriveItem;
    const parent = parentDir(normalized);
    const entry = toRemoteEntry(item, parent);
    return { ...entry, exists: true };
  }
}

class OneDriveTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: OneDriveSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = `${this.options.driveBaseUrl}${itemSegment(normalized)}/content`;
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    // Microsoft Graph 302-redirects /content to a short-lived blob URL; fetch
    // implementations follow redirects by default. We probe item metadata
    // first so the file checksum can be surfaced on the read result.
    const meta = await this.fetchItem(normalized);
    const response = await graphFetch(this.options, "GET", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: headers,
    });
    if (!response.ok && response.status !== 206) {
      throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        details: { path: normalized },
        message: `OneDrive download for ${normalized} produced no body`,
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
    const checksum = preferHash(meta.file?.hashes);
    if (checksum !== undefined) result.checksum = checksum;
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "OneDrive provider does not yet support cross-attempt resume of upload sessions",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const multipart = this.options.multipart;
    const buffered = await collectChunks(request.content);
    if (!multipart.enabled || buffered.byteLength <= multipart.thresholdBytes) {
      return this.singleShotPut(request, normalized, buffered);
    }
    return this.writeUploadSession(request, normalized, buffered);
  }

  private async singleShotPut(
    request: ProviderTransferWriteRequest,
    normalized: string,
    buffered: Uint8Array,
  ): Promise<ProviderTransferWriteResult> {
    const url = `${this.options.driveBaseUrl}${itemSegment(normalized)}/content`;
    const response = await graphFetch(this.options, "PUT", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: { "content-type": "application/octet-stream" },
    });
    if (!response.ok) {
      throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
    }
    const item = (await response.json()) as DriveItem;
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    const checksum = preferHash(item.file?.hashes);
    if (checksum !== undefined) result.checksum = checksum;
    return result;
  }

  private async writeUploadSession(
    request: ProviderTransferWriteRequest,
    normalized: string,
    buffered: Uint8Array,
  ): Promise<ProviderTransferWriteResult> {
    const partSize = this.options.multipart.partSizeBytes;
    const total = buffered.byteLength;
    const sessionUrl = `${this.options.driveBaseUrl}${itemSegment(normalized)}/createUploadSession`;
    const initiate = await graphFetch(this.options, "POST", sessionUrl, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: new TextEncoder().encode(
        JSON.stringify({ item: { "@microsoft.graph.conflictBehavior": "replace" } }),
      ),
      extraHeaders: { "content-type": "application/json" },
    });
    if (!initiate.ok) {
      throw mapOneDriveResponseError(initiate, normalized, await safeReadText(initiate));
    }
    const initiateBody = (await initiate.json()) as { uploadUrl?: string };
    const uploadUrl = initiateBody.uploadUrl;
    if (typeof uploadUrl !== "string" || uploadUrl === "") {
      throw new ConnectionError({
        details: { path: normalized },
        message: "OneDrive createUploadSession returned no uploadUrl",
        retryable: true,
      });
    }

    let bytesTransferred = 0;
    let finalItem: DriveItem | undefined;
    try {
      while (bytesTransferred < total) {
        request.throwIfAborted();
        const chunkEnd = Math.min(bytesTransferred + partSize, total);
        const chunk = buffered.subarray(bytesTransferred, chunkEnd);
        const response = await graphSessionFetch(this.options, uploadUrl, {
          ...(request.signal !== undefined ? { signal: request.signal } : {}),
          body: chunk,
          extraHeaders: {
            "content-length": String(chunk.byteLength),
            "content-range": `bytes ${String(bytesTransferred)}-${String(chunkEnd - 1)}/${String(total)}`,
            "content-type": "application/octet-stream",
          },
        });
        if (response.status === 202) {
          bytesTransferred = chunkEnd;
          request.reportProgress(bytesTransferred, total);
          continue;
        }
        if (response.status === 200 || response.status === 201) {
          bytesTransferred = chunkEnd;
          request.reportProgress(bytesTransferred, total);
          finalItem = (await response.json()) as DriveItem;
          break;
        }
        throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
      }
    } catch (error) {
      void graphSessionFetch(this.options, uploadUrl, { method: "DELETE" }).catch(() => undefined);
      throw error;
    }

    if (finalItem === undefined) {
      throw new ConnectionError({
        details: { path: normalized },
        message: "OneDrive upload session did not return a final DriveItem",
        retryable: true,
      });
    }
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      totalBytes: bytesTransferred,
    };
    const checksum = preferHash(finalItem.file?.hashes);
    if (checksum !== undefined) result.checksum = checksum;
    return result;
  }

  private async fetchItem(normalized: string): Promise<DriveItem> {
    const url = `${this.options.driveBaseUrl}${itemSegment(normalized)}`;
    const response = await graphFetch(this.options, "GET", url);
    if (!response.ok) {
      throw mapOneDriveResponseError(response, normalized, await safeReadText(response));
    }
    return (await response.json()) as DriveItem;
  }
}

interface GraphFetchOptions {
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function graphFetch(
  options: OneDriveSessionOptions,
  method: string,
  url: string,
  fetchOptions: GraphFetchOptions = {},
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
      () => controller.abort(new Error("OneDrive request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ConnectionError({
      cause: error,
      details: { url },
      message: `OneDrive request to ${url} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

interface GraphSessionFetchOptions {
  method?: string;
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Fetcher for the pre-signed `uploadUrl` returned by `createUploadSession`.
 * The upload URL embeds its own auth token, so we deliberately do **not**
 * send the Graph bearer token (which would be rejected as a malformed
 * Authorization header on the upload endpoint).
 */
async function graphSessionFetch(
  options: OneDriveSessionOptions,
  uploadUrl: string,
  fetchOptions: GraphSessionFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(fetchOptions.extraHeaders ?? {}),
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
      () => controller.abort(new Error("OneDrive upload session request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(uploadUrl, { ...init, signal: controller.signal });
  } catch (error) {
    const safeUrl = redactSessionUrl(uploadUrl);
    throw new ConnectionError({
      cause: error,
      details: { url: safeUrl },
      message: `OneDrive upload session request to ${safeUrl} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Strips the query string from a pre-signed upload URL before logging it,
 * since the query carries the upload-session credential.
 */
function redactSessionUrl(url: string): string {
  const queryStart = url.indexOf("?");
  return queryStart === -1 ? url : `${url.slice(0, queryStart)}?<redacted>`;
}

function mapOneDriveResponseError(
  response: Response,
  contextPath: string,
  bodyText: string,
): Error {
  const details = {
    bodyText: bodyText.slice(0, 500),
    path: contextPath,
    status: response.status,
    statusText: response.statusText,
  };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `OneDrive authentication failed for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `OneDrive access forbidden for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `OneDrive path not found: ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 429) {
    return new ConnectionError({
      details,
      message: `OneDrive rate limit hit for ${contextPath}`,
      retryable: true,
    });
  }
  return new ConnectionError({
    details,
    message: `OneDrive request for ${contextPath} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

function toRemoteEntry(item: DriveItem, parent: string): RemoteEntry {
  const path = joinPath(parent, item.name);
  const entry: RemoteEntry = {
    name: item.name,
    path,
    raw: item,
    type: item.folder !== undefined ? "directory" : "file",
    uniqueId: item.id,
  };
  if (typeof item.size === "number") entry.size = item.size;
  if (typeof item.lastModifiedDateTime === "string") {
    const parsed = new Date(item.lastModifiedDateTime);
    if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
  }
  if (typeof item.createdDateTime === "string") {
    const parsed = new Date(item.createdDateTime);
    if (!Number.isNaN(parsed.getTime())) entry.createdAt = parsed;
  }
  return entry;
}

function preferHash(hashes: DriveItemHashes | undefined): string | undefined {
  if (hashes === undefined) return undefined;
  if (typeof hashes.sha256Hash === "string" && hashes.sha256Hash.length > 0) {
    return hashes.sha256Hash;
  }
  if (typeof hashes.sha1Hash === "string" && hashes.sha1Hash.length > 0) {
    return hashes.sha1Hash;
  }
  if (typeof hashes.quickXorHash === "string" && hashes.quickXorHash.length > 0) {
    return hashes.quickXorHash;
  }
  return undefined;
}

/** Builds the `/root` or `/root:/encoded/path:` segment for a Graph drive URL. */
function itemSegment(normalized: string): string {
  if (normalized === "/" || normalized === "") return "/root";
  const trimmed = normalized.replace(/^\/+/u, "");
  return `/root:/${encodeDrivePath(trimmed)}:`;
}

/** Builds the `/root/children` or `/root:/path:/children` listing segment. */
function itemChildrenSegment(normalized: string): string {
  if (normalized === "/" || normalized === "") return "/root/children";
  const trimmed = normalized.replace(/^\/+/u, "");
  return `/root:/${encodeDrivePath(trimmed)}:/children`;
}

function encodeDrivePath(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function joinPath(parent: string, name: string): string {
  if (parent === "" || parent === "/") return `/${name}`;
  return parent.endsWith("/") ? `${parent}${name}` : `${parent}/${name}`;
}

function parentDir(normalized: string): string {
  if (normalized === "/" || normalized === "") return "/";
  const idx = normalized.lastIndexOf("/");
  if (idx <= 0) return "/";
  return normalized.slice(0, idx);
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
