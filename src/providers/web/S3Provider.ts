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
}

const S3_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["etag"];

/**
 * Creates an S3-compatible provider factory.
 *
 * Credentials must be supplied via the connection profile: `username` is the
 * access key id and `password` is the secret access key. `profile.host` may
 * be set to the bucket name (taking precedence over `options.bucket`).
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

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["password", "token"],
    checksum: [...S3_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 16,
    metadata: ["modifiedAt", "mimeType", "uniqueId"],
    notes: [
      "S3 provider performs single-shot PUT uploads; multipart upload is not yet supported.",
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
      new S3Provider({
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        endpointUrl,
        fetch: fetchImpl,
        id,
        pathStyle,
        region,
        service,
        ...(options.bucket !== undefined ? { bucket: options.bucket } : {}),
        ...(options.sessionToken !== undefined ? { sessionToken: options.sessionToken } : {}),
      }),
    id,
  };
}

interface S3ProviderInternalOptions {
  bucket?: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  endpointUrl: URL;
  fetch: HttpFetch;
  id: ProviderId;
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

    const bucket = profile.host !== undefined && profile.host !== "" ? profile.host : this.internals.bucket;
    if (bucket === undefined || bucket === "") {
      throw new ConfigurationError({
        message: "S3 provider requires a bucket via S3ProviderOptions.bucket or ConnectionProfile.host",
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
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "S3 provider does not yet support multipart/resume uploads",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
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
    timer = setTimeout(() => controller.abort(new Error("S3 request timed out")), options.timeoutMs);
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
