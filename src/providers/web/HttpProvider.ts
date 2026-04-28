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
  ConfigurationError,
  ConnectionError,
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
import {
  buildBaseUrl,
  dispatchRequest,
  formatRangeHeader,
  mapResponseError,
  parseTotalBytes,
  resolveUrl,
  secretToString,
  webStreamToAsyncIterable,
  type HttpFetch,
  type HttpSessionTransport,
} from "./httpInternals";

export type { HttpFetch };

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
      headers["Authorization"] =
        `Basic ${Buffer.from(`${usernameText}:${passwordText}`).toString("base64")}`;
    }

    const baseUrl = buildSessionBaseUrl(profile, this.internals);
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

interface HttpSessionOptions extends HttpSessionTransport {
  capabilities: CapabilitySet;
  id: ProviderId;
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

function buildSessionBaseUrl(
  profile: ConnectionProfile,
  internals: HttpProviderInternalOptions,
): URL {
  return buildBaseUrl(profile, { basePath: internals.basePath, secure: internals.secure });
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

// Placeholder export so TypeScript treats the module import as side-effect free.
export type { TransferDataSource };
