/**
 * Dropbox cloud-drive provider.
 *
 * Talks to the Dropbox HTTP API (`api.dropboxapi.com` for RPC, `content.dropboxapi.com`
 * for file content) using a bearer token sourced from the connection profile
 * (`profile.password` resolved as a `SecretSource`). Supports `list` (with
 * pagination via `list_folder/continue`), `stat` (`get_metadata`), `read`
 * (`files/download` with optional `Range`) and single-shot `write`
 * (`files/upload`). Resumable upload sessions are not yet implemented.
 *
 * @module providers/cloud/DropboxProvider
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
import type {
  ConnectionProfile,
  RemoteEntry,
  RemoteStat,
} from "../../types/public";
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
import {
  formatRangeHeader,
  parseTotalBytes,
  secretToString,
  webStreamToAsyncIterable,
  type HttpFetch,
} from "../web/httpInternals";

export type { HttpFetch };

const DROPBOX_API_BASE = "https://api.dropboxapi.com";
const DROPBOX_CONTENT_BASE = "https://content.dropboxapi.com";

const DROPBOX_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["dropbox-content-hash"];

/** Options accepted by {@link createDropboxProviderFactory}. */
export interface DropboxProviderOptions {
  /** Provider id to register. Defaults to `"dropbox"`. */
  id?: ProviderId;
  /** Override the RPC base URL. Defaults to `https://api.dropboxapi.com`. */
  apiBaseUrl?: string;
  /** Override the content base URL. Defaults to `https://content.dropboxapi.com`. */
  contentBaseUrl?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied to every request before bearer auth. */
  defaultHeaders?: Record<string, string>;
}

/**
 * Creates a Dropbox provider factory.
 *
 * The bearer token is resolved per-connection from `profile.password`. The
 * `profile.host` field is unused; Dropbox connections are identified solely by
 * their token.
 */
export function createDropboxProviderFactory(
  options: DropboxProviderOptions = {},
): ProviderFactory {
  const id: ProviderId = options.id ?? "dropbox";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const apiBaseUrl = options.apiBaseUrl ?? DROPBOX_API_BASE;
  const contentBaseUrl = options.contentBaseUrl ?? DROPBOX_CONTENT_BASE;

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message:
        "Global fetch is unavailable; supply DropboxProviderOptions.fetch explicitly",
      retryable: false,
    });
  }

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["token", "oauth"],
    checksum: [...DROPBOX_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 4,
    metadata: ["modifiedAt", "uniqueId"],
    notes: [
      "Dropbox provider performs single-shot uploads via /2/files/upload; resumable upload sessions are not yet supported.",
    ],
    provider: id,
    readStream: true,
    resumeDownload: true,
    resumeUpload: false,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: true,
  };

  return {
    capabilities,
    create: () =>
      new DropboxProvider({
        apiBaseUrl,
        capabilities,
        contentBaseUrl,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        fetch: fetchImpl,
        id,
      }),
    id,
  };
}

interface DropboxProviderInternalOptions {
  apiBaseUrl: string;
  capabilities: CapabilitySet;
  contentBaseUrl: string;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
}

class DropboxProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: DropboxProviderInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    if (profile.password === undefined) {
      throw new ConfigurationError({
        message: "Dropbox provider requires a bearer token via profile.password",
        retryable: false,
      });
    }
    const token = secretToString(await resolveSecret(profile.password));
    if (token === "") {
      throw new ConfigurationError({
        message: "Dropbox bearer token resolved to an empty string",
        retryable: false,
      });
    }
    const sessionOptions: DropboxSessionOptions = {
      apiBaseUrl: this.internals.apiBaseUrl,
      capabilities: this.internals.capabilities,
      contentBaseUrl: this.internals.contentBaseUrl,
      defaultHeaders: this.internals.defaultHeaders,
      fetch: this.internals.fetch,
      id: this.internals.id,
      token,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new DropboxSession(sessionOptions);
  }
}

interface DropboxSessionOptions {
  apiBaseUrl: string;
  capabilities: CapabilitySet;
  contentBaseUrl: string;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  timeoutMs?: number;
  token: string;
}

class DropboxSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: DropboxSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new DropboxFileSystem(options);
    this.transfers = new DropboxTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class DropboxFileSystem implements RemoteFileSystem {
  constructor(private readonly options: DropboxSessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const apiPath = toDropboxPath(normalized);
    const entries: RemoteEntry[] = [];
    let cursor: string | undefined;
    do {
      const body = cursor === undefined
        ? { include_media_info: false, path: apiPath, recursive: false }
        : { cursor };
      const endpoint = cursor === undefined
        ? "/2/files/list_folder"
        : "/2/files/list_folder/continue";
      const response = await dropboxRpc(this.options, endpoint, body);
      const parsed = (await response.json()) as DropboxListFolderResponse;
      for (const raw of parsed.entries) {
        const entry = toRemoteEntry(raw, normalized);
        if (entry !== undefined) entries.push(entry);
      }
      cursor = parsed.has_more === true ? parsed.cursor : undefined;
    } while (cursor !== undefined);
    return entries;
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const apiPath = toDropboxPath(normalized);
    const response = await dropboxRpc(this.options, "/2/files/get_metadata", {
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_media_info: false,
      path: apiPath,
    });
    const raw = (await response.json()) as DropboxMetadata;
    const parent = parentDir(normalized);
    const entry = toRemoteEntry(raw, parent);
    if (entry === undefined) {
      throw new PathNotFoundError({
        details: { path: normalized },
        message: `Dropbox returned no metadata for ${normalized}`,
        retryable: false,
      });
    }
    return { ...entry, exists: true };
  }
}

class DropboxTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: DropboxSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const apiArg = JSON.stringify({ path: toDropboxPath(normalized) });
    const headers: Record<string, string> = {
      "Dropbox-API-Arg": apiArg,
    };
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const url = `${this.options.contentBaseUrl}/2/files/download`;
    const response = await dropboxFetch(this.options, url, "POST", {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: headers,
    });
    if (!response.ok && response.status !== 206) {
      throw mapDropboxResponseError(response, normalized, await safeReadText(response));
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        details: { path: normalized },
        message: `Dropbox download for ${normalized} produced no body`,
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
    const hash = readApiResultHeader(response)?.content_hash;
    if (typeof hash === "string" && hash.length > 0) result.checksum = hash;
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "Dropbox provider does not yet support resumable upload sessions",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const buffered = await collectChunks(request.content);
    const apiArg = JSON.stringify({
      autorename: false,
      mode: "overwrite",
      mute: true,
      path: toDropboxPath(normalized),
      strict_conflict: false,
    });
    const url = `${this.options.contentBaseUrl}/2/files/upload`;
    const response = await dropboxFetch(this.options, url, "POST", {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: {
        "content-type": "application/octet-stream",
        "Dropbox-API-Arg": apiArg,
      },
    });
    if (!response.ok) {
      throw mapDropboxResponseError(response, normalized, await safeReadText(response));
    }
    const meta = (await response.json()) as DropboxFileMetadata;
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    if (typeof meta.content_hash === "string" && meta.content_hash.length > 0) {
      result.checksum = meta.content_hash;
    }
    return result;
  }
}

interface DropboxFetchOptions {
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function dropboxFetch(
  options: DropboxSessionOptions,
  url: string,
  method: string,
  fetchOptions: DropboxFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
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
      () => controller.abort(new Error("Dropbox request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ConnectionError({
      cause: error,
      details: { url },
      message: `Dropbox request to ${url} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function dropboxRpc(
  options: DropboxSessionOptions,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const url = `${options.apiBaseUrl}${endpoint}`;
  const encoded = new TextEncoder().encode(JSON.stringify(body));
  const response = await dropboxFetch(options, url, "POST", {
    body: encoded,
    extraHeaders: { "content-type": "application/json" },
  });
  if (!response.ok) {
    const text = await safeReadText(response);
    throw mapDropboxResponseError(response, endpoint, text);
  }
  return response;
}

function mapDropboxResponseError(
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
      message: `Dropbox authentication failed for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `Dropbox access forbidden for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 409 && /not_found/.test(bodyText)) {
    return new PathNotFoundError({
      details,
      message: `Dropbox path not found: ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 429) {
    return new ConnectionError({
      details,
      message: `Dropbox rate limit hit for ${contextPath}`,
      retryable: true,
    });
  }
  return new ConnectionError({
    details,
    message: `Dropbox request for ${contextPath} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

interface DropboxListFolderResponse {
  entries: DropboxMetadata[];
  cursor: string;
  has_more?: boolean;
}

interface DropboxMetadataBase {
  ".tag": "file" | "folder" | "deleted";
  id?: string;
  name: string;
  path_display?: string;
  path_lower?: string;
}

interface DropboxFileMetadata extends DropboxMetadataBase {
  ".tag": "file";
  size?: number;
  client_modified?: string;
  server_modified?: string;
  content_hash?: string;
  rev?: string;
}

interface DropboxFolderMetadata extends DropboxMetadataBase {
  ".tag": "folder";
}

type DropboxMetadata = DropboxFileMetadata | DropboxFolderMetadata | DropboxMetadataBase;

function toRemoteEntry(raw: DropboxMetadata, parentPath: string): RemoteEntry | undefined {
  if (raw[".tag"] === "deleted") return undefined;
  const displayName = raw.name;
  const path = raw.path_display ?? joinDropboxPath(parentPath, displayName);
  const entry: RemoteEntry = {
    name: basenameRemotePath(path),
    path,
    raw,
    type: raw[".tag"] === "folder" ? "directory" : "file",
  };
  if (raw[".tag"] === "file") {
    const file = raw as DropboxFileMetadata;
    if (typeof file.size === "number") entry.size = file.size;
    const modified = file.server_modified ?? file.client_modified;
    if (typeof modified === "string") {
      const parsed = new Date(modified);
      if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
    }
    if (typeof file.content_hash === "string") entry.uniqueId = file.content_hash;
    else if (typeof file.id === "string") entry.uniqueId = file.id;
  } else if (typeof raw.id === "string") {
    entry.uniqueId = raw.id;
  }
  return entry;
}

function toDropboxPath(normalized: string): string {
  if (normalized === "/" || normalized === "") return "";
  return normalized;
}

function joinDropboxPath(parent: string, name: string): string {
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

function readApiResultHeader(response: Response): { content_hash?: string } | undefined {
  const header = response.headers.get("dropbox-api-result");
  if (header === null || header === "") return undefined;
  try {
    return JSON.parse(header) as { content_hash?: string };
  } catch {
    return undefined;
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
