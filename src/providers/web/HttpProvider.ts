/**
 * HTTP(S) read-only provider.
 *
 * Connects to a remote web origin and exposes downloads via standard `GET` with
 * `Range` resume support and metadata via `HEAD`. The provider is intentionally
 * read-only — uploads should target a `webdav` or `s3` provider once those land.
 *
 * @module providers/web/HttpProvider
 */
import { Buffer } from "node:buffer";
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  TimeoutError,
  UnsupportedFeatureError,
} from "../../errors/ZeroTransferError";
import { resolveSecret } from "../../profiles/SecretSource";
import type { ConnectionProfile, RemoteEntry, RemoteStat } from "../../types/public";
import { basenameRemotePath, normalizeRemotePath } from "../../utils/path";
import type { TransferProvider } from "../Provider";
import type { ProviderFactory } from "../ProviderFactory";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteResult,
  TransferDataSource,
} from "../ProviderTransferOperations";
import type { RemoteFileSystem } from "../RemoteFileSystem";

/** Fetch implementation accepted by the HTTP provider. Defaults to global `fetch`. */
export type HttpFetch = (input: string, init?: RequestInit) => Promise<Response>;

/** Options accepted by {@link createHttpProviderFactory}. */
export interface HttpProviderOptions {
  /** Provider id to register. Defaults to `"http"`. Set to `"https"` for the HTTPS variant. */
  id?: ProviderId;
  /** Whether the provider should treat connections as TLS-only. Defaults to `true` when `id === "https"`. */
  secure?: boolean;
  /** Base URL prefix prepended to relative endpoint paths. Defaults to `""`. */
  basePath?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied to every request. */
  defaultHeaders?: Record<string, string>;
}

const HTTP_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["etag"];

/**
 * Creates a provider factory backed by HTTP(S) GET/HEAD.
 *
 * @param options - Optional provider configuration.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createHttpProviderFactory(options: HttpProviderOptions = {}): ProviderFactory {
  const id: ProviderId = options.id ?? "http";
  const secure = options.secure ?? id === "https";
  const basePath = options.basePath ?? "";
  const fetchImpl = options.fetch ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply HttpProviderOptions.fetch explicitly",
      retryable: false,
    });
  }

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["anonymous", "password", "token"],
    checksum: [...HTTP_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: false,
    maxConcurrency: 8,
    metadata: ["modifiedAt", "mimeType", "uniqueId"],
    notes: ["Read-only HTTP(S) provider. Uploads are not supported."],
    provider: id,
    readStream: true,
    resumeDownload: true,
    resumeUpload: false,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: false,
  };

  return {
    capabilities,
    create: () =>
      new HttpProvider({
        basePath,
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        fetch: fetchImpl,
        id,
        secure,
      }),
    id,
  };
}

interface HttpProviderInternalOptions {
  basePath: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  secure: boolean;
}

class HttpProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: HttpProviderInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    const headers = { ...this.internals.defaultHeaders };
    if (profile.username !== undefined) {
      const username = await resolveSecret(profile.username);
      const password = profile.password !== undefined ? await resolveSecret(profile.password) : "";
      const usernameText = secretToString(username);
      const passwordText = secretToString(password);
      headers["Authorization"] = `Basic ${Buffer.from(`${usernameText}:${passwordText}`).toString("base64")}`;
    }

    const baseUrl = buildBaseUrl(profile, this.internals);
    const sessionOptions: HttpSessionOptions = {
      baseUrl,
      capabilities: this.internals.capabilities,
      fetch: this.internals.fetch,
      headers,
      id: this.internals.id,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    const session = new HttpTransferSession(sessionOptions);
    return session;
  }
}

interface HttpSessionOptions {
  baseUrl: URL;
  capabilities: CapabilitySet;
  fetch: HttpFetch;
  headers: Record<string, string>;
  id: ProviderId;
  timeoutMs?: number;
}

class HttpTransferSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(private readonly options: HttpSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new HttpFileSystem(options);
    this.transfers = new HttpTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class HttpFileSystem implements RemoteFileSystem {
  constructor(private readonly options: HttpSessionOptions) {}

  list(): Promise<RemoteEntry[]> {
    return Promise.reject(
      new UnsupportedFeatureError({
        message: "HTTP provider does not support directory listing",
        retryable: false,
      }),
    );
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const response = await dispatchRequest(this.options, url, {
      method: "HEAD",
    });
    if (!response.ok) {
      throw mapResponseError(response, normalized);
    }
    return responseToStat(response, normalized);
  }
}

class HttpTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: HttpSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["Range"] = formatRangeHeader(request.range.offset, request.range.length);
    }

    const requestInit: RequestInit & { headers?: Record<string, string> } = {
      headers,
      method: "GET",
    };
    if (request.signal !== undefined) requestInit.signal = request.signal;
    const response = await dispatchRequest(this.options, url, requestInit);

    if (!response.ok && response.status !== 206) {
      throw mapResponseError(response, normalized);
    }

    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        message: `HTTP response had no body for ${url.toString()}`,
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

  write(): Promise<ProviderTransferWriteResult> {
    return Promise.reject(
      new UnsupportedFeatureError({
        message: "HTTP provider is read-only; uploads are not supported",
        retryable: false,
      }),
    );
  }
}

function buildBaseUrl(
  profile: ConnectionProfile,
  internals: HttpProviderInternalOptions,
): URL {
  const protocol = internals.secure ? "https:" : "http:";
  const portSegment = profile.port !== undefined ? `:${profile.port}` : "";
  const path = internals.basePath.length === 0 ? "/" : ensureLeadingSlash(internals.basePath);
  try {
    return new URL(`${protocol}//${profile.host}${portSegment}${path}`);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: { host: profile.host, port: profile.port },
      message: "HTTP provider received an invalid host or basePath",
      retryable: false,
    });
  }
}

function resolveUrl(baseUrl: URL, remotePath: string): URL {
  const trimmedBase = baseUrl.pathname.replace(/\/+$/, "");
  const suffix = remotePath === "/" ? "" : remotePath;
  const merged = new URL(baseUrl.toString());
  merged.pathname = `${trimmedBase}${suffix}`;
  return merged;
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

async function dispatchRequest(
  options: HttpSessionOptions,
  url: URL,
  init: RequestInit & { headers?: Record<string, string> },
): Promise<Response> {
  const headers = { ...options.headers, ...(init.headers ?? {}) };
  const controller = new AbortController();
  const upstreamSignal = init.signal ?? null;
  if (upstreamSignal !== null) {
    if (upstreamSignal.aborted) controller.abort(upstreamSignal.reason);
    else upstreamSignal.addEventListener("abort", () => controller.abort(upstreamSignal.reason));
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(new Error("HTTP request timed out")), options.timeoutMs);
  }

  try {
    return await options.fetch(url.toString(), {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted && upstreamSignal?.aborted !== true) {
      throw new TimeoutError({
        cause: error,
        details: { timeoutMs: options.timeoutMs, url: url.toString() },
        message: `HTTP request to ${url.toString()} timed out after ${String(options.timeoutMs)}ms`,
        retryable: true,
      });
    }
    throw new ConnectionError({
      cause: error,
      details: { url: url.toString() },
      message: `HTTP request to ${url.toString()} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function responseToStat(response: Response, normalizedPath: string): RemoteStat {
  const stat: RemoteStat = {
    exists: true,
    name: basenameRemotePath(normalizedPath),
    path: normalizedPath,
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

function parseTotalBytes(response: Response, rangeOffset: number | undefined): number | undefined {
  if (response.status === 206) {
    const contentRange = response.headers.get("content-range");
    if (contentRange !== null) {
      const total = parseContentRangeTotal(contentRange);
      if (total !== undefined) return total;
    }
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength === null) return undefined;
  const length = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(length) || length < 0) return undefined;
  return rangeOffset !== undefined && rangeOffset > 0 ? length + rangeOffset : length;
}

function parseContentRangeTotal(value: string): number | undefined {
  const match = /\/(\d+)\s*$/.exec(value);
  if (match === null) return undefined;
  const total = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(total) ? total : undefined;
}

function formatRangeHeader(offset: number, length: number | undefined): string {
  if (length === undefined) return `bytes=${String(offset)}-`;
  const end = offset + length - 1;
  return `bytes=${String(offset)}-${String(end)}`;
}

function mapResponseError(response: Response, path: string): Error {
  const details = { path, status: response.status, statusText: response.statusText };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `HTTP authentication failed for ${path} (${String(response.status)})`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `HTTP access forbidden for ${path} (${String(response.status)})`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `HTTP path not found: ${path}`,
      retryable: false,
    });
  }
  return new ConnectionError({
    details,
    message: `HTTP request for ${path} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

async function* webStreamToAsyncIterable(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<Uint8Array> {
  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value !== undefined) yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function secretToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return Buffer.from(value as Uint8Array).toString("utf8");
  }
  return String(value);
}

// Placeholder export so TypeScript treats the module import as side-effect free.
export type { TransferDataSource };
