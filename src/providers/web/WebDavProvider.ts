/**
 * WebDAV provider.
 *
 * Wraps a WebDAV-capable HTTP server with `PROPFIND` listings/stat, `GET`
 * downloads (with `Range` resume), and `PUT` uploads. Built on top of the
 * shared HTTP transport helpers used by {@link createHttpProviderFactory}.
 *
 * @module providers/web/WebDavProvider
 */
import { Buffer } from "node:buffer";
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import {
  ConfigurationError,
  ConnectionError,
  ProtocolError,
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
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
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

/** Options accepted by {@link createWebDavProviderFactory}. */
export interface WebDavProviderOptions {
  /** Provider id to register. Defaults to `"webdav"`. */
  id?: ProviderId;
  /** Whether the transport is TLS. Defaults to `false`; set `true` or use https `port`. */
  secure?: boolean;
  /** Path prefix prepended to remote paths. Defaults to `""`. */
  basePath?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied to every request. */
  defaultHeaders?: Record<string, string>;
  /**
   * Streaming policy for `PUT` request bodies.
   *
   * - `"when-known-size"` (default) — stream when the caller declares
   *   `request.totalBytes` (an explicit `Content-Length` is sent so all
   *   WebDAV servers accept the upload); otherwise buffer the entire body in
   *   memory before sending. This is the safe default that does not require
   *   the server to accept HTTP/1.1 chunked transfer-encoding.
   * - `"always"` — always stream the body, even when the size is unknown
   *   (the runtime will use chunked transfer-encoding). Some legacy WebDAV
   *   servers reject `Transfer-Encoding: chunked` and will respond `411
   *   Length Required` or `501 Not Implemented`; only enable this for
   *   servers known to accept chunked uploads (modern Apache/nginx, IIS
   *   with chunked transfer enabled, Nextcloud, ownCloud, sabre/dav).
   * - `"never"` — always buffer (legacy behaviour pre-0.4.0). Use for
   *   maximum compatibility at the cost of memory.
   */
  uploadStreaming?: "when-known-size" | "always" | "never";
}

const WEBDAV_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["etag"];

/**
 * Creates a WebDAV provider factory.
 *
 * @param options - Optional provider configuration.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createWebDavProviderFactory(options: WebDavProviderOptions = {}): ProviderFactory {
  const id: ProviderId = options.id ?? "webdav";
  const secure = options.secure ?? false;
  const basePath = options.basePath ?? "";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const uploadStreaming = options.uploadStreaming ?? "when-known-size";

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply WebDavProviderOptions.fetch explicitly",
      retryable: false,
    });
  }

  const streamingNote =
    uploadStreaming === "always"
      ? "PUT bodies are always streamed (chunked when size is unknown)."
      : uploadStreaming === "never"
        ? "PUT bodies are buffered in memory (uploadStreaming: 'never')."
        : "PUT bodies stream when totalBytes is known; otherwise buffered in memory.";

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["anonymous", "password", "token"],
    checksum: [...WEBDAV_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 8,
    metadata: ["modifiedAt", "mimeType", "uniqueId"],
    notes: [streamingNote],
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
      new WebDavProvider({
        basePath,
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        fetch: fetchImpl,
        id,
        secure,
        uploadStreaming,
      }),
    id,
  };
}

interface WebDavProviderInternalOptions {
  basePath: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  secure: boolean;
  uploadStreaming: "when-known-size" | "always" | "never";
}

class WebDavProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: WebDavProviderInternalOptions) {
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
      headers["Authorization"] = `Basic ${Buffer.from(`${usernameText}:${passwordText}`).toString(
        "base64",
      )}`;
    }

    const baseUrl = buildBaseUrl(profile, {
      basePath: this.internals.basePath,
      secure: this.internals.secure,
    });
    const sessionOptions: WebDavSessionOptions = {
      baseUrl,
      capabilities: this.internals.capabilities,
      fetch: this.internals.fetch,
      headers,
      id: this.internals.id,
      uploadStreaming: this.internals.uploadStreaming,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new WebDavSession(sessionOptions);
  }
}

interface WebDavSessionOptions extends HttpSessionTransport {
  capabilities: CapabilitySet;
  id: ProviderId;
  uploadStreaming: "when-known-size" | "always" | "never";
}

class WebDavSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: WebDavSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new WebDavFileSystem(options);
    this.transfers = new WebDavTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class WebDavFileSystem implements RemoteFileSystem {
  constructor(private readonly options: WebDavSessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const response = await dispatchRequest(this.options, url, {
      headers: { Depth: "1", "Content-Type": "application/xml" },
      method: "PROPFIND",
    });
    if (!response.ok && response.status !== 207) {
      throw mapResponseError(response, normalized);
    }
    const body = await response.text();
    const entries = parsePropfindResponses(body, this.options.baseUrl);
    return entries
      .filter((entry) => entry.path !== normalized && entry.path !== `${normalized}/`)
      .map((entry) => normalizeEntry(entry, normalized));
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const response = await dispatchRequest(this.options, url, {
      headers: { Depth: "0", "Content-Type": "application/xml" },
      method: "PROPFIND",
    });
    if (!response.ok && response.status !== 207) {
      throw mapResponseError(response, normalized);
    }
    const body = await response.text();
    const entries = parsePropfindResponses(body, this.options.baseUrl);
    const target =
      entries.find((entry) => entry.path === normalized || entry.path === `${normalized}/`) ??
      entries[0];
    if (target === undefined) {
      throw new ProtocolError({
        details: { path: normalized },
        message: "WebDAV PROPFIND returned no responses",
        retryable: false,
      });
    }
    const entry = normalizeEntry(target, parentOf(normalized));
    const stat: RemoteStat = {
      exists: true,
      name: entry.name,
      path: normalized,
      type: entry.type,
    };
    if (entry.size !== undefined) stat.size = entry.size;
    if (entry.modifiedAt !== undefined) stat.modifiedAt = entry.modifiedAt;
    if (entry.uniqueId !== undefined) stat.uniqueId = entry.uniqueId;
    return stat;
  }
}

class WebDavTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: WebDavSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["Range"] = formatRangeHeader(request.range.offset, request.range.length);
    }

    const init: RequestInit & { headers?: Record<string, string> } = {
      headers,
      method: "GET",
    };
    if (request.signal !== undefined) init.signal = request.signal;
    const response = await dispatchRequest(this.options, url, init);

    if (!response.ok && response.status !== 206) {
      throw mapResponseError(response, normalized);
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        message: `WebDAV response had no body for ${url.toString()}`,
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
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "WebDAV provider does not support resumable uploads",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const totalBytes = request.totalBytes;
    const policy = this.options.uploadStreaming;

    // Choose between streaming and buffered PUT.
    //   * "never"            -> always buffer
    //   * "always"           -> always stream (chunked when size unknown)
    //   * "when-known-size"  -> stream if totalBytes is known, else buffer
    const shouldStream =
      policy === "always" ||
      (policy === "when-known-size" && typeof totalBytes === "number" && totalBytes >= 0);

    if (!shouldStream) {
      const buffered = await collectChunks(request.content);
      const headers: Record<string, string> = {
        "Content-Length": String(buffered.byteLength),
        "Content-Type": "application/octet-stream",
      };
      const init: RequestInit & { headers?: Record<string, string> } = {
        body: buffered,
        headers,
        method: "PUT",
      };
      if (request.signal !== undefined) init.signal = request.signal;
      const response = await dispatchRequest(this.options, url, init);
      if (!response.ok) {
        throw mapResponseError(response, normalized);
      }
      request.reportProgress(buffered.byteLength, buffered.byteLength);
      const result: ProviderTransferWriteResult = {
        bytesTransferred: buffered.byteLength,
        totalBytes: buffered.byteLength,
      };
      const etag = response.headers.get("etag");
      if (etag !== null) result.checksum = etag;
      return result;
    }

    // Streaming path: convert the AsyncIterable<Uint8Array> source to a
    // ReadableStream and report progress as bytes flow through.
    let bytesTransferred = 0;
    const knownTotal = typeof totalBytes === "number" ? totalBytes : undefined;
    const stream = asyncIterableToReadableStream(request.content, (chunk) => {
      bytesTransferred += chunk.byteLength;
      if (knownTotal !== undefined) {
        request.reportProgress(bytesTransferred, knownTotal);
      } else {
        request.reportProgress(bytesTransferred);
      }
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
    };
    if (knownTotal !== undefined) {
      // Sending an explicit Content-Length avoids HTTP/1.1 chunked
      // transfer-encoding, which some legacy WebDAV servers reject.
      headers["Content-Length"] = String(knownTotal);
    }

    // `duplex: "half"` is required by Node's fetch (and the spec) when the
    // request body is a ReadableStream so the runtime knows we are not going
    // to read the response before fully writing the request.
    const init: RequestInit & {
      headers?: Record<string, string>;
      duplex?: "half";
    } = {
      body: stream,
      duplex: "half",
      headers,
      method: "PUT",
    };
    if (request.signal !== undefined) init.signal = request.signal;
    const response = await dispatchRequest(this.options, url, init);
    if (!response.ok) {
      throw mapResponseError(response, normalized);
    }
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      ...(knownTotal !== undefined ? { totalBytes: knownTotal } : { totalBytes: bytesTransferred }),
    };
    const etag = response.headers.get("etag");
    if (etag !== null) result.checksum = etag;
    return result;
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

/**
 * Adapts an `AsyncIterable<Uint8Array>` into a Web `ReadableStream<Uint8Array>`
 * suitable for passing as a `fetch` request body. Invokes `onChunk` after each
 * chunk is enqueued so callers can report transfer progress.
 */
function asyncIterableToReadableStream(
  source: AsyncIterable<Uint8Array>,
  onChunk: (chunk: Uint8Array) => void,
): ReadableStream<Uint8Array> {
  const iterator = source[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done === true) {
          controller.close();
          return;
        }
        const chunk = next.value;
        if (chunk.byteLength === 0) {
          // Drop empty chunks; pull() will be invoked again on demand.
          return;
        }
        controller.enqueue(chunk);
        onChunk(chunk);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      if (typeof iterator.return === "function") {
        try {
          await iterator.return(reason);
        } catch {
          // Ignore: cancellation is best-effort.
        }
      }
    },
  });
}

interface PropfindEntry {
  path: string;
  type: "file" | "directory";
  size?: number;
  modifiedAt?: Date;
  uniqueId?: string;
}

function parsePropfindResponses(xml: string, baseUrl: URL): PropfindEntry[] {
  const entries: PropfindEntry[] = [];
  const responseRegex =
    /<(?:[a-zA-Z0-9-]+:)?response\b[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9-]+:)?response>/gi;
  let match: RegExpExecArray | null;
  while ((match = responseRegex.exec(xml)) !== null) {
    const inner = match[1] ?? "";
    const href = extractTag(inner, "href");
    if (href === undefined) continue;
    const path = decodeHref(href, baseUrl);
    const propBlock = extractTag(inner, "prop") ?? inner;
    const isCollection = /<(?:[a-zA-Z0-9-]+:)?collection\b/i.test(propBlock);
    const sizeText = extractTag(propBlock, "getcontentlength");
    const modifiedText = extractTag(propBlock, "getlastmodified");
    const etag = extractTag(propBlock, "getetag");
    const entry: PropfindEntry = {
      path,
      type: isCollection ? "directory" : "file",
    };
    if (sizeText !== undefined) {
      const size = Number.parseInt(sizeText.trim(), 10);
      if (Number.isFinite(size) && size >= 0) entry.size = size;
    }
    if (modifiedText !== undefined) {
      const parsed = new Date(modifiedText.trim());
      if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
    }
    if (etag !== undefined) entry.uniqueId = etag.trim();
    entries.push(entry);
  }
  return entries;
}

function extractTag(xml: string, localName: string): string | undefined {
  const pattern = new RegExp(
    `<(?:[a-zA-Z0-9-]+:)?${localName}\\b[^>]*?(?:/>|>([\\s\\S]*?)</(?:[a-zA-Z0-9-]+:)?${localName}>)`,
    "i",
  );
  const match = pattern.exec(xml);
  if (match === null) return undefined;
  return match[1] ?? "";
}

function decodeHref(rawHref: string, baseUrl: URL): string {
  const decoded = decodeURIComponent(rawHref.trim());
  let pathname = decoded;
  if (/^https?:\/\//i.test(decoded)) {
    try {
      pathname = new URL(decoded).pathname;
    } catch {
      pathname = decoded;
    }
  }
  const basePathname = baseUrl.pathname.replace(/\/+$/, "");
  if (basePathname.length > 0 && pathname.startsWith(basePathname)) {
    pathname = pathname.slice(basePathname.length);
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return pathname;
}

function normalizeEntry(entry: PropfindEntry, parentPath: string): RemoteEntry {
  const trimmed = entry.path.endsWith("/") ? entry.path.slice(0, -1) : entry.path;
  const name = basenameRemotePath(trimmed === "" ? "/" : trimmed);
  const result: RemoteEntry = {
    name: name === "" ? trimmed : name,
    path: trimmed === "" ? "/" : trimmed,
    type: entry.type,
  };
  if (entry.size !== undefined) result.size = entry.size;
  if (entry.modifiedAt !== undefined) result.modifiedAt = entry.modifiedAt;
  if (entry.uniqueId !== undefined) result.uniqueId = entry.uniqueId;
  void parentPath;
  return result;
}

function parentOf(path: string): string {
  if (path === "/" || path === "") return "/";
  const idx = path.lastIndexOf("/");
  if (idx <= 0) return "/";
  return path.slice(0, idx);
}
