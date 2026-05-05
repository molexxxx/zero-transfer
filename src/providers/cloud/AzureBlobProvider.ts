/**
 * Azure Blob Storage object-store provider.
 *
 * Targets the Azure Blob REST API (`https://{account}.blob.core.windows.net`)
 * and supports listing blobs in a container, reading ranged blob content,
 * single-shot block-blob uploads via `PUT`, and HEAD-based stat. Authentication
 * is via SAS token (appended to every URL) or a pre-resolved bearer token from
 * `profile.password` (`Authorization: Bearer ...` for AAD scenarios).
 *
 * @module providers/cloud/AzureBlobProvider
 */
import type { CapabilitySet, ChecksumCapability } from "../../core/CapabilitySet";
import type { ProviderId } from "../../core/ProviderId";
import type { TransferSession } from "../../core/TransferSession";
import { randomBytes as cryptoRandomBytes } from "node:crypto";
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

const AZURE_BLOB_API_VERSION = "2023-11-03";
const AZURE_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["md5"];
const DEFAULT_AZURE_PART_SIZE = 8 * 1024 * 1024;
const DEFAULT_AZURE_THRESHOLD = 8 * 1024 * 1024;
// Azure caps a single Put Block at 4000 MiB; we reject configs above that.
const AZURE_MAX_PART_SIZE = 4000 * 1024 * 1024;

/** Options accepted by {@link createAzureBlobProviderFactory}. */
export interface AzureBlobProviderOptions {
  /** Provider id to register. Defaults to `"azure-blob"`. */
  id?: ProviderId;
  /** Storage account name; combined with `endpoint` when no full URL is supplied. */
  account?: string;
  /** Container name. Required. */
  container: string;
  /**
   * Override the endpoint host. Defaults to
   * `https://{account}.blob.core.windows.net`. Provide for sovereign clouds
   * or Azurite (`http://127.0.0.1:10000/devstoreaccount1`).
   */
  endpoint?: string;
  /** SAS token query string (without leading `?`). Mutually compatible with bearer auth. */
  sasToken?: string;
  /** Override the `x-ms-version` header. */
  apiVersion?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied before bearer auth on every request. */
  defaultHeaders?: Record<string, string>;
  /** Multipart (staged-block) upload tuning. Enabled by default. */
  multipart?: AzureBlobMultipartOptions;
}

/** Multipart (staged block) upload tuning for the Azure Blob provider. */
export interface AzureBlobMultipartOptions {
  /**
   * Enable staged-block uploads via `Put Block` + `Put Block List`. **Defaults
   * to `true`** so payloads above {@link AzureBlobMultipartOptions.thresholdBytes}
   * stream in fixed-size blocks instead of being buffered into a single PUT.
   * Set to `false` to force single-shot block-blob PUTs.
   */
  enabled?: boolean;
  /** Object size threshold above which staged-block upload is used. Defaults to 8 MiB. */
  thresholdBytes?: number;
  /** Target block size in bytes. Defaults to 8 MiB. Maximum 4000 MiB per Azure. */
  partSizeBytes?: number;
}

interface ResolvedAzureMultipartOptions {
  enabled: boolean;
  thresholdBytes: number;
  partSizeBytes: number;
}

/**
 * Creates an Azure Blob Storage provider factory.
 *
 * The container is fixed at factory construction time. Authenticate per-connection
 * with either a SAS token (configured at factory level via {@link AzureBlobProviderOptions.sasToken})
 * or an AAD bearer token resolved from `profile.password`. Override `endpoint` for
 * sovereign clouds or local Azurite testing.
 *
 * @param options - Container plus optional endpoint, SAS token, fetch override.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example AAD-bearer upload
 * ```ts
 * import { createAzureBlobProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createAzureBlobProviderFactory({ container: "snapshots" })],
 * });
 *
 * await uploadFile({
 *   client,
 *   localPath: "./snapshots/2026-04-28.tar.zst",
 *   destination: {
 *     path: "/2026/04/28/snapshot.tar.zst",
 *     profile: {
 *       host: "mystorageacct",
 *       provider: "azure-blob",
 *       password: { env: "AZURE_AAD_TOKEN" },
 *     },
 *   },
 * });
 * ```
 *
 * @example SAS-token + Azurite emulator
 * ```ts
 * createAzureBlobProviderFactory({
 *   container: "devstoreaccount1",
 *   endpoint: "http://127.0.0.1:10000/devstoreaccount1",
 *   sasToken: "sv=2024-11-04&ss=b&srt=co&sp=rwdlac&se=...",
 * });
 * ```
 */
export function createAzureBlobProviderFactory(options: AzureBlobProviderOptions): ProviderFactory {
  if (typeof options.container !== "string" || options.container === "") {
    throw new ConfigurationError({
      message: "AzureBlobProviderOptions.container is required",
      retryable: false,
    });
  }
  const id: ProviderId = options.id ?? "azure-blob";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply AzureBlobProviderOptions.fetch explicitly",
      retryable: false,
    });
  }
  const endpoint = resolveAzureEndpoint(options);
  const apiVersion = options.apiVersion ?? AZURE_BLOB_API_VERSION;
  const multipartEnabled = options.multipart?.enabled ?? true;
  const partSizeBytes = options.multipart?.partSizeBytes ?? DEFAULT_AZURE_PART_SIZE;
  const thresholdBytes = options.multipart?.thresholdBytes ?? DEFAULT_AZURE_THRESHOLD;
  if (multipartEnabled) {
    if (!Number.isInteger(partSizeBytes) || partSizeBytes <= 0) {
      throw new ConfigurationError({
        details: { partSizeBytes },
        message: "AzureBlobMultipartOptions.partSizeBytes must be a positive integer",
        retryable: false,
      });
    }
    if (partSizeBytes > AZURE_MAX_PART_SIZE) {
      throw new ConfigurationError({
        details: { maxBytes: AZURE_MAX_PART_SIZE, partSizeBytes },
        message: `AzureBlobMultipartOptions.partSizeBytes must not exceed ${String(AZURE_MAX_PART_SIZE)} bytes (4000 MiB)`,
        retryable: false,
      });
    }
    if (!Number.isInteger(thresholdBytes) || thresholdBytes < 0) {
      throw new ConfigurationError({
        details: { thresholdBytes },
        message: "AzureBlobMultipartOptions.thresholdBytes must be a non-negative integer",
        retryable: false,
      });
    }
  }
  const multipart: ResolvedAzureMultipartOptions = {
    enabled: multipartEnabled,
    partSizeBytes,
    thresholdBytes,
  };

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["token", "oauth"],
    checksum: [...AZURE_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 4,
    metadata: ["modifiedAt", "uniqueId"],
    notes: multipartEnabled
      ? [
          `Azure Blob staged-block upload enabled by default (partSize=${String(multipart.partSizeBytes)}B, threshold=${String(multipart.thresholdBytes)}B).`,
          "Payloads at or below the threshold automatically fall back to single-shot block-blob PUT.",
          "Pass `multipart: { enabled: false }` to force the legacy single-shot behaviour.",
        ]
      : [
          "Azure Blob provider performs single-shot block-blob uploads via PUT; entire object is buffered in memory before transmission.",
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
      new AzureBlobProvider({
        apiVersion,
        capabilities,
        container: options.container,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        endpoint,
        fetch: fetchImpl,
        id,
        multipart,
        ...(options.sasToken !== undefined ? { sasToken: options.sasToken } : {}),
      }),
    id,
  };
}

function resolveAzureEndpoint(options: AzureBlobProviderOptions): string {
  if (typeof options.endpoint === "string" && options.endpoint !== "") {
    return options.endpoint.replace(/\/+$/u, "");
  }
  if (typeof options.account === "string" && options.account !== "") {
    return `https://${options.account}.blob.core.windows.net`;
  }
  throw new ConfigurationError({
    message: "AzureBlobProviderOptions requires either `account` or `endpoint`",
    retryable: false,
  });
}

interface AzureBlobInternalOptions {
  apiVersion: string;
  capabilities: CapabilitySet;
  container: string;
  defaultHeaders: Record<string, string>;
  endpoint: string;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedAzureMultipartOptions;
  sasToken?: string;
}

class AzureBlobProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: AzureBlobInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    let bearerToken: string | undefined;
    if (profile.password !== undefined) {
      bearerToken = secretToString(await resolveSecret(profile.password));
      if (bearerToken === "") bearerToken = undefined;
    }
    if (bearerToken === undefined && this.internals.sasToken === undefined) {
      throw new ConfigurationError({
        message:
          "Azure Blob provider requires either a SAS token (via options.sasToken) or a bearer token (via profile.password)",
        retryable: false,
      });
    }
    const sessionOptions: AzureBlobSessionOptions = {
      apiVersion: this.internals.apiVersion,
      capabilities: this.internals.capabilities,
      container: this.internals.container,
      defaultHeaders: this.internals.defaultHeaders,
      endpoint: this.internals.endpoint,
      fetch: this.internals.fetch,
      id: this.internals.id,
      multipart: this.internals.multipart,
    };
    if (bearerToken !== undefined) sessionOptions.bearerToken = bearerToken;
    if (this.internals.sasToken !== undefined) sessionOptions.sasToken = this.internals.sasToken;
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new AzureBlobSession(sessionOptions);
  }
}

interface AzureBlobSessionOptions {
  apiVersion: string;
  bearerToken?: string;
  capabilities: CapabilitySet;
  container: string;
  defaultHeaders: Record<string, string>;
  endpoint: string;
  fetch: HttpFetch;
  id: ProviderId;
  multipart: ResolvedAzureMultipartOptions;
  sasToken?: string;
  timeoutMs?: number;
}

class AzureBlobSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: AzureBlobSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new AzureBlobFileSystem(options);
    this.transfers = new AzureBlobTransferOperations(options);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class AzureBlobFileSystem implements RemoteFileSystem {
  constructor(private readonly options: AzureBlobSessionOptions) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const normalized = normalizeRemotePath(path);
    const prefix = toAzureBlobPrefix(normalized);
    const entries: RemoteEntry[] = [];
    let marker: string | undefined;
    do {
      const params: Record<string, string> = {
        comp: "list",
        delimiter: "/",
        restype: "container",
      };
      if (prefix !== "") params["prefix"] = prefix;
      if (marker !== undefined) params["marker"] = marker;
      const url = buildContainerUrl(this.options, params);
      const response = await azureFetch(this.options, "GET", url);
      if (!response.ok) {
        throw mapAzureResponseError(response, normalized, await safeReadText(response));
      }
      const xml = await response.text();
      const parsed = parseListBlobsResponse(xml);
      for (const blob of parsed.blobs) {
        if (blob.name.startsWith(prefix)) {
          const entry = blobToEntry(blob, prefix, normalized);
          if (entry !== undefined) entries.push(entry);
        }
      }
      for (const dir of parsed.prefixes) {
        const entry = prefixToEntry(dir, prefix, normalized);
        if (entry !== undefined) entries.push(entry);
      }
      marker = parsed.nextMarker;
    } while (marker !== undefined && marker !== "");
    return entries;
  }

  async stat(path: string): Promise<RemoteStat> {
    const normalized = normalizeRemotePath(path);
    const url = buildBlobUrl(this.options, normalized);
    const response = await azureFetch(this.options, "HEAD", url);
    if (!response.ok) {
      throw mapAzureResponseError(response, normalized, await safeReadText(response));
    }
    const sizeHeader = response.headers.get("content-length");
    const size = sizeHeader !== null ? Number(sizeHeader) : undefined;
    const lastModified = response.headers.get("last-modified");
    const etag = response.headers.get("etag") ?? undefined;
    const md5 = response.headers.get("content-md5") ?? undefined;
    const stat: RemoteStat = {
      exists: true,
      name: basenameRemotePath(normalized),
      path: normalized,
      type: "file",
    };
    if (typeof size === "number" && Number.isFinite(size)) stat.size = size;
    if (lastModified !== null) {
      const parsed = new Date(lastModified);
      if (!Number.isNaN(parsed.getTime())) stat.modifiedAt = parsed;
    }
    if (etag !== undefined) stat.uniqueId = etag;
    else if (md5 !== undefined) stat.uniqueId = md5;
    return stat;
  }
}

class AzureBlobTransferOperations implements ProviderTransferOperations {
  constructor(private readonly options: AzureBlobSessionOptions) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = buildBlobUrl(this.options, normalized);
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const response = await azureFetch(this.options, "GET", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      extraHeaders: headers,
    });
    if (!response.ok && response.status !== 206) {
      throw mapAzureResponseError(response, normalized, await safeReadText(response));
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        details: { path: normalized },
        message: `Azure Blob download for ${normalized} produced no body`,
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
    const md5 = response.headers.get("content-md5");
    if (md5 !== null && md5 !== "") result.checksum = md5;
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message:
          "Azure Blob provider does not yet support cross-attempt resume of staged-block uploads",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const multipart = this.options.multipart;
    if (!multipart.enabled) {
      const buffered = await collectChunks(request.content);
      return this.singleShotPut(request, normalized, buffered);
    }
    return this.writeStagedBlocks(request, normalized);
  }

  private async singleShotPut(
    request: ProviderTransferWriteRequest,
    normalized: string,
    buffered: Uint8Array,
  ): Promise<ProviderTransferWriteResult> {
    const url = buildBlobUrl(this.options, normalized);
    const response = await azureFetch(this.options, "PUT", url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: buffered,
      extraHeaders: {
        "content-type": "application/octet-stream",
        "x-ms-blob-type": "BlockBlob",
      },
    });
    if (!response.ok) {
      throw mapAzureResponseError(response, normalized, await safeReadText(response));
    }
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    const md5 = response.headers.get("content-md5");
    if (md5 !== null && md5 !== "") result.checksum = md5;
    return result;
  }

  private async writeStagedBlocks(
    request: ProviderTransferWriteRequest,
    normalized: string,
  ): Promise<ProviderTransferWriteResult> {
    const multipart = this.options.multipart;
    const partSize = multipart.partSizeBytes;
    const iterator = request.content[Symbol.asyncIterator]();
    // Per-upload nonce keeps block ids unique across concurrent writers targeting
    // the same blob path (uncommitted blocks linger for 7 days on Azure).
    const uploadNonce = generateUploadNonce();

    // Buffer up to thresholdBytes so small payloads fall back to single-shot PUT.
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
      return this.singleShotPut(request, normalized, concatChunks(initialBuffer, initialSize));
    }

    const blockIds: string[] = [];
    let bytesTransferred = 0;
    let partNumber = 1;
    let buffer: Uint8Array[] = [...initialBuffer];
    let bufferSize = initialSize;

    const flushBlocks = async (final: boolean): Promise<void> => {
      while (bufferSize >= partSize || (final && bufferSize > 0)) {
        const take = Math.min(bufferSize, partSize);
        const sliced = sliceFromBuffers(buffer, take);
        buffer = sliced.remaining;
        bufferSize -= sliced.bytes.byteLength;
        const blockId = encodeBlockId(uploadNonce, partNumber);
        const blockUrl = buildBlobUrl(this.options, normalized, {
          blockid: blockId,
          comp: "block",
        });
        const response = await azureFetch(this.options, "PUT", blockUrl, {
          ...(request.signal !== undefined ? { signal: request.signal } : {}),
          body: sliced.bytes,
          extraHeaders: { "content-type": "application/octet-stream" },
        });
        if (!response.ok) {
          throw mapAzureResponseError(response, normalized, await safeReadText(response));
        }
        blockIds.push(blockId);
        bytesTransferred += sliced.bytes.byteLength;
        request.reportProgress(bytesTransferred, undefined);
        partNumber += 1;
      }
    };

    await flushBlocks(false);
    while (true) {
      request.throwIfAborted();
      const next = await iterator.next();
      if (next.done === true) break;
      if (next.value.byteLength === 0) continue;
      buffer.push(next.value);
      bufferSize += next.value.byteLength;
      await flushBlocks(false);
    }
    await flushBlocks(true);

    if (blockIds.length === 0) {
      throw new ConnectionError({
        message: "Azure Blob staged-block upload completed with zero blocks",
        retryable: false,
      });
    }

    const commitUrl = buildBlobUrl(this.options, normalized, { comp: "blocklist" });
    const xmlBody = buildBlockListXml(blockIds);
    const commitResponse = await azureFetch(this.options, "PUT", commitUrl, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body: new TextEncoder().encode(xmlBody),
      extraHeaders: {
        "content-type": "application/xml",
        "x-ms-blob-content-type": "application/octet-stream",
      },
    });
    if (!commitResponse.ok) {
      throw mapAzureResponseError(commitResponse, normalized, await safeReadText(commitResponse));
    }
    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      totalBytes: bytesTransferred,
    };
    const md5 = commitResponse.headers.get("content-md5");
    if (md5 !== null && md5 !== "") result.checksum = md5;
    return result;
  }
}

interface AzureFetchOptions {
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function azureFetch(
  options: AzureBlobSessionOptions,
  method: string,
  url: string,
  fetchOptions: AzureFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...options.defaultHeaders,
    ...(fetchOptions.extraHeaders ?? {}),
    "x-ms-version": options.apiVersion,
  };
  if (options.bearerToken !== undefined) {
    headers["authorization"] = `Bearer ${options.bearerToken}`;
  }
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
      () => controller.abort(new Error("Azure Blob request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ConnectionError({
      cause: error,
      details: { url },
      message: `Azure Blob request to ${url} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function buildContainerUrl(
  options: AzureBlobSessionOptions,
  params: Record<string, string>,
): string {
  const search = new URLSearchParams(params);
  appendSas(search, options.sasToken);
  return `${options.endpoint}/${encodeURIComponent(options.container)}?${search.toString()}`;
}

function buildBlobUrl(
  options: AzureBlobSessionOptions,
  normalized: string,
  extraParams?: Record<string, string>,
): string {
  const blobPath = normalized.replace(/^\/+/u, "");
  const encoded = blobPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const base = `${options.endpoint}/${encodeURIComponent(options.container)}/${encoded}`;
  const search = new URLSearchParams();
  if (extraParams !== undefined) {
    for (const [k, v] of Object.entries(extraParams)) search.set(k, v);
  }
  appendSas(search, options.sasToken);
  const query = search.toString();
  return query === "" ? base : `${base}?${query}`;
}

function appendSas(search: URLSearchParams, sasToken: string | undefined): void {
  if (sasToken === undefined || sasToken === "") return;
  const sas = new URLSearchParams(sasToken);
  for (const [k, v] of sas.entries()) search.set(k, v);
}

interface AzureBlobListing {
  blobs: Array<{
    name: string;
    contentLength?: number;
    contentMd5?: string;
    etag?: string;
    lastModified?: string;
  }>;
  prefixes: string[];
  nextMarker?: string;
}

/**
 * Minimal XML parser for `ListBlobs` responses. The Azure response is
 * deterministic, so we extract the fields we need with regex-driven slicing
 * rather than pulling in a full XML dependency.
 */
function parseListBlobsResponse(xml: string): AzureBlobListing {
  const blobs: AzureBlobListing["blobs"] = [];
  for (const match of xml.matchAll(/<Blob>([\s\S]*?)<\/Blob>/g)) {
    const block = match[1] ?? "";
    const name = extractTag(block, "Name");
    if (name === undefined) continue;
    const blob: AzureBlobListing["blobs"][number] = { name };
    const length = extractTag(block, "Content-Length");
    if (length !== undefined) {
      const parsed = Number(length);
      if (Number.isFinite(parsed)) blob.contentLength = parsed;
    }
    const md5 = extractTag(block, "Content-MD5");
    if (md5 !== undefined && md5 !== "") blob.contentMd5 = md5;
    const etag = extractTag(block, "Etag");
    if (etag !== undefined && etag !== "") blob.etag = etag;
    const last = extractTag(block, "Last-Modified");
    if (last !== undefined && last !== "") blob.lastModified = last;
    blobs.push(blob);
  }
  const prefixes: string[] = [];
  for (const match of xml.matchAll(/<BlobPrefix>([\s\S]*?)<\/BlobPrefix>/g)) {
    const block = match[1] ?? "";
    const name = extractTag(block, "Name");
    if (name !== undefined) prefixes.push(name);
  }
  const nextMarker = extractTag(xml, "NextMarker");
  const result: AzureBlobListing = { blobs, prefixes };
  if (nextMarker !== undefined && nextMarker !== "") result.nextMarker = nextMarker;
  return result;
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = re.exec(block);
  if (match === null) return undefined;
  return decodeXmlText(match[1] ?? "");
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function blobToEntry(
  blob: AzureBlobListing["blobs"][number],
  prefix: string,
  parent: string,
): RemoteEntry | undefined {
  const tail = blob.name.slice(prefix.length);
  if (tail === "" || tail.includes("/")) return undefined;
  const entry: RemoteEntry = {
    name: tail,
    path: joinPath(parent, tail),
    raw: blob,
    type: "file",
    uniqueId: blob.etag ?? blob.contentMd5 ?? blob.name,
  };
  if (typeof blob.contentLength === "number") entry.size = blob.contentLength;
  if (typeof blob.lastModified === "string") {
    const parsed = new Date(blob.lastModified);
    if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
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

function toAzureBlobPrefix(normalized: string): string {
  if (normalized === "/" || normalized === "") return "";
  const trimmed = normalized.replace(/^\/+/u, "");
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function joinPath(parent: string, name: string): string {
  if (parent === "" || parent === "/") return `/${name}`;
  return parent.endsWith("/") ? `${parent}${name}` : `${parent}/${name}`;
}

function basenameRemotePath(normalized: string): string {
  if (normalized === "/" || normalized === "") return "";
  const trimmed = normalized.replace(/\/+$/u, "");
  const idx = trimmed.lastIndexOf("/");
  return idx === -1 ? trimmed : trimmed.slice(idx + 1);
}

function mapAzureResponseError(response: Response, contextPath: string, bodyText: string): Error {
  const details = {
    bodyText: bodyText.slice(0, 500),
    path: contextPath,
    status: response.status,
    statusText: response.statusText,
  };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `Azure Blob authentication failed for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `Azure Blob access forbidden for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `Azure Blob path not found: ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 429) {
    return new ConnectionError({
      details,
      message: `Azure Blob throttled for ${contextPath}`,
      retryable: true,
    });
  }
  return new ConnectionError({
    details,
    message: `Azure Blob request for ${contextPath} failed with status ${String(response.status)}`,
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

/**
 * Builds an Azure block id. Azure requires every block id within a blob to
 * be the same byte length pre-base64-encoding (≤64 bytes). We use a
 * fixed-length `${nonce}-NNNNNNNNN` layout (8-hex-char nonce + dash +
 * 9-digit padded part number = 18 bytes) so concurrent uploads to the same
 * blob path do not share block ids; uncommitted blocks live for 7 days on
 * Azure and a stale uploader reusing a deterministic id could otherwise
 * commit the wrong bytes.
 */
function encodeBlockId(nonce: string, partNumber: number): string {
  const padded = String(partNumber).padStart(9, "0");
  const raw = `${nonce}-${padded}`;
  return Buffer.from(raw, "utf8").toString("base64");
}

/**
 * 8-hex-char per-upload nonce sourced from `node:crypto.randomBytes`.
 */
function generateUploadNonce(): string {
  return cryptoRandomBytes(4).toString("hex");
}

function buildBlockListXml(blockIds: ReadonlyArray<string>): string {
  const items = blockIds.map((id) => `<Latest>${escapeXml(id)}</Latest>`).join("");
  return `<?xml version="1.0" encoding="utf-8"?><BlockList>${items}</BlockList>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
