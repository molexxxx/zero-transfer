/**
 * Google Drive cloud-drive provider.
 *
 * Talks to the Google Drive v3 REST API using a bearer token sourced from the
 * connection profile (`profile.password` resolved as a `SecretSource`). Drive
 * is id-addressed rather than path-addressed; the provider maps incoming
 * remote paths to Drive file ids by walking from the configured root folder
 * (`options.rootFolderId`, defaults to the special id `"root"`).
 *
 * @module providers/cloud/GoogleDriveProvider
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

const GDRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const GDRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const GDRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";

const GDRIVE_CHECKSUM_CAPABILITIES: ChecksumCapability[] = ["md5", "sha256", "crc32c"];

const GDRIVE_FILE_FIELDS =
  "id,name,mimeType,size,modifiedTime,createdTime,md5Checksum,sha256Checksum,parents,trashed";
const GDRIVE_LIST_FIELDS = `nextPageToken,files(${GDRIVE_FILE_FIELDS})`;

/** Options accepted by {@link createGoogleDriveProviderFactory}. */
export interface GoogleDriveProviderOptions {
  /** Provider id to register. Defaults to `"google-drive"`. */
  id?: ProviderId;
  /** Override the API base URL. Defaults to `https://www.googleapis.com/drive/v3`. */
  apiBaseUrl?: string;
  /** Override the upload base URL. Defaults to `https://www.googleapis.com/upload/drive/v3`. */
  uploadBaseUrl?: string;
  /**
   * Folder id used as the root for path resolution. Defaults to `"root"` (the
   * authenticated user's My Drive root). Pass a folder id when the SDK should
   * scope to a shared drive subtree.
   */
  rootFolderId?: string;
  /** Custom fetch implementation. Defaults to global `fetch`. */
  fetch?: HttpFetch;
  /** Default headers applied to every request before bearer auth. */
  defaultHeaders?: Record<string, string>;
}

/**
 * Creates a Google Drive provider factory.
 *
 * The bearer token is resolved per-connection from `profile.password`
 * (typically an OAuth 2 access token). `profile.host` is unused.
 */
export function createGoogleDriveProviderFactory(
  options: GoogleDriveProviderOptions = {},
): ProviderFactory {
  const id: ProviderId = options.id ?? "google-drive";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const apiBaseUrl = options.apiBaseUrl ?? GDRIVE_API_BASE;
  const uploadBaseUrl = options.uploadBaseUrl ?? GDRIVE_UPLOAD_BASE;
  const rootFolderId = options.rootFolderId ?? "root";

  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message:
        "Global fetch is unavailable; supply GoogleDriveProviderOptions.fetch explicitly",
      retryable: false,
    });
  }

  const capabilities: CapabilitySet = {
    atomicRename: false,
    authentication: ["token", "oauth"],
    checksum: [...GDRIVE_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: true,
    maxConcurrency: 4,
    metadata: ["modifiedAt", "createdAt", "mimeType", "uniqueId"],
    notes: [
      "Google Drive provider performs single-shot multipart uploads via /upload/drive/v3/files; resumable upload sessions are not yet supported.",
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
      new GoogleDriveProvider({
        apiBaseUrl,
        capabilities,
        defaultHeaders: { ...(options.defaultHeaders ?? {}) },
        fetch: fetchImpl,
        id,
        rootFolderId,
        uploadBaseUrl,
      }),
    id,
  };
}

interface GoogleDriveInternalOptions {
  apiBaseUrl: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  rootFolderId: string;
  uploadBaseUrl: string;
}

class GoogleDriveProvider implements TransferProvider {
  readonly id: ProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly internals: GoogleDriveInternalOptions) {
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    if (profile.password === undefined) {
      throw new ConfigurationError({
        message: "Google Drive provider requires a bearer token via profile.password",
        retryable: false,
      });
    }
    const token = secretToString(await resolveSecret(profile.password));
    if (token === "") {
      throw new ConfigurationError({
        message: "Google Drive bearer token resolved to an empty string",
        retryable: false,
      });
    }
    const sessionOptions: GoogleDriveSessionOptions = {
      apiBaseUrl: this.internals.apiBaseUrl,
      capabilities: this.internals.capabilities,
      defaultHeaders: this.internals.defaultHeaders,
      fetch: this.internals.fetch,
      id: this.internals.id,
      rootFolderId: this.internals.rootFolderId,
      token,
      uploadBaseUrl: this.internals.uploadBaseUrl,
    };
    if (profile.timeoutMs !== undefined) sessionOptions.timeoutMs = profile.timeoutMs;
    return new GoogleDriveSession(sessionOptions);
  }
}

interface GoogleDriveSessionOptions {
  apiBaseUrl: string;
  capabilities: CapabilitySet;
  defaultHeaders: Record<string, string>;
  fetch: HttpFetch;
  id: ProviderId;
  rootFolderId: string;
  timeoutMs?: number;
  token: string;
  uploadBaseUrl: string;
}

class GoogleDriveSession implements TransferSession {
  readonly provider: ProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(options: GoogleDriveSessionOptions) {
    this.provider = options.id;
    this.capabilities = options.capabilities;
    const resolver = new GoogleDrivePathResolver(options);
    this.fs = new GoogleDriveFileSystem(options, resolver);
    this.transfers = new GoogleDriveTransferOperations(options, resolver);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

interface DriveFileResource {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  md5Checksum?: string;
  sha256Checksum?: string;
  parents?: string[];
  trashed?: boolean;
}

interface DriveListResponse {
  files: DriveFileResource[];
  nextPageToken?: string;
}

class GoogleDrivePathResolver {
  private readonly cache = new Map<string, DriveFileResource>();

  constructor(private readonly options: GoogleDriveSessionOptions) {}

  /** Resolves an absolute remote path to the Drive file resource for that node. */
  async resolvePath(path: string): Promise<DriveFileResource> {
    const normalized = normalizeRemotePath(path);
    if (normalized === "/" || normalized === "") {
      return {
        id: this.options.rootFolderId,
        mimeType: GDRIVE_FOLDER_MIME,
        name: "",
      };
    }
    const cached = this.cache.get(normalized);
    if (cached !== undefined) return cached;
    const segments = normalized.split("/").filter((s) => s !== "");
    let parent: DriveFileResource = {
      id: this.options.rootFolderId,
      mimeType: GDRIVE_FOLDER_MIME,
      name: "",
    };
    let walked = "";
    for (const segment of segments) {
      const child = await this.findChild(parent.id, segment);
      if (child === undefined) {
        throw new PathNotFoundError({
          details: { path: normalized },
          message: `Google Drive path not found: ${normalized}`,
          retryable: false,
        });
      }
      walked = `${walked}/${segment}`;
      this.cache.set(walked, child);
      parent = child;
    }
    return parent;
  }

  /** Resolves the parent folder id for a path; throws on missing parent. */
  async resolveParentId(path: string): Promise<string> {
    const normalized = normalizeRemotePath(path);
    if (normalized === "/" || normalized === "") return this.options.rootFolderId;
    const idx = normalized.lastIndexOf("/");
    if (idx <= 0) return this.options.rootFolderId;
    const parentPath = normalized.slice(0, idx);
    const parent = await this.resolvePath(parentPath);
    return parent.id;
  }

  private async findChild(
    parentId: string,
    name: string,
  ): Promise<DriveFileResource | undefined> {
    const q = `'${escapeDriveQ(parentId)}' in parents and name = '${escapeDriveQ(name)}' and trashed = false`;
    const response = await driveApi(this.options, "GET", `/files?${buildSearch({
      fields: GDRIVE_LIST_FIELDS,
      pageSize: "10",
      q,
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    })}`);
    const parsed = (await response.json()) as DriveListResponse;
    return parsed.files.find((f) => f.name === name);
  }
}

class GoogleDriveFileSystem implements RemoteFileSystem {
  constructor(
    private readonly options: GoogleDriveSessionOptions,
    private readonly resolver: GoogleDrivePathResolver,
  ) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const folder = await this.resolver.resolvePath(path);
    if (folder.mimeType !== GDRIVE_FOLDER_MIME && folder.id !== this.options.rootFolderId) {
      throw new PathNotFoundError({
        details: { path },
        message: `Google Drive path is not a folder: ${path}`,
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(path);
    const entries: RemoteEntry[] = [];
    let pageToken: string | undefined;
    do {
      const params: Record<string, string> = {
        fields: GDRIVE_LIST_FIELDS,
        includeItemsFromAllDrives: "true",
        pageSize: "100",
        q: `'${escapeDriveQ(folder.id)}' in parents and trashed = false`,
        supportsAllDrives: "true",
      };
      if (pageToken !== undefined) params["pageToken"] = pageToken;
      const response = await driveApi(this.options, "GET", `/files?${buildSearch(params)}`);
      const parsed = (await response.json()) as DriveListResponse;
      for (const file of parsed.files) {
        entries.push(toRemoteEntry(file, normalized));
      }
      pageToken = parsed.nextPageToken;
    } while (pageToken !== undefined);
    return entries;
  }

  async stat(path: string): Promise<RemoteStat> {
    const file = await this.resolver.resolvePath(path);
    const normalized = normalizeRemotePath(path);
    const parent = parentDir(normalized);
    const entry = toRemoteEntry(file, parent);
    return { ...entry, exists: true };
  }
}

class GoogleDriveTransferOperations implements ProviderTransferOperations {
  constructor(
    private readonly options: GoogleDriveSessionOptions,
    private readonly resolver: GoogleDrivePathResolver,
  ) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const file = await this.resolver.resolvePath(normalized);
    const headers: Record<string, string> = {};
    if (request.range !== undefined) {
      headers["range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const params = buildSearch({ alt: "media", supportsAllDrives: "true" });
    const response = await driveFetch(
      this.options,
      "GET",
      `${this.options.apiBaseUrl}/files/${encodeURIComponent(file.id)}?${params}`,
      {
        ...(request.signal !== undefined ? { signal: request.signal } : {}),
        extraHeaders: headers,
      },
    );
    if (!response.ok && response.status !== 206) {
      throw mapGoogleDriveResponseError(response, normalized, await safeReadText(response));
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        details: { path: normalized },
        message: `Google Drive download for ${normalized} produced no body`,
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
    if (typeof file.md5Checksum === "string" && file.md5Checksum.length > 0) {
      result.checksum = file.md5Checksum;
    }
    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    if (request.offset !== undefined && request.offset > 0) {
      throw new UnsupportedFeatureError({
        details: { offset: request.offset },
        message: "Google Drive provider does not yet support resumable upload sessions",
        retryable: false,
      });
    }
    const normalized = normalizeRemotePath(request.endpoint.path);
    const buffered = await collectChunks(request.content);
    const parentId = await this.resolver.resolveParentId(normalized);
    const name = basenameRemotePath(normalized);
    const existing = await this.findExisting(parentId, name);

    const metadata: Record<string, unknown> = { name };
    if (existing === undefined) metadata["parents"] = [parentId];

    const boundary = `----zt-boundary-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    const bodyParts: Uint8Array[] = [];
    const enc = new TextEncoder();
    bodyParts.push(
      enc.encode(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      ),
    );
    bodyParts.push(enc.encode(`--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`));
    bodyParts.push(buffered);
    bodyParts.push(enc.encode(`\r\n--${boundary}--\r\n`));
    const body = concatChunks(bodyParts);

    const url =
      existing === undefined
        ? `${this.options.uploadBaseUrl}/files?uploadType=multipart&supportsAllDrives=true&fields=${encodeURIComponent(GDRIVE_FILE_FIELDS)}`
        : `${this.options.uploadBaseUrl}/files/${encodeURIComponent(existing.id)}?uploadType=multipart&supportsAllDrives=true&fields=${encodeURIComponent(GDRIVE_FILE_FIELDS)}`;
    const method = existing === undefined ? "POST" : "PATCH";

    const response = await driveFetch(this.options, method, url, {
      ...(request.signal !== undefined ? { signal: request.signal } : {}),
      body,
      extraHeaders: { "content-type": `multipart/related; boundary=${boundary}` },
    });
    if (!response.ok) {
      throw mapGoogleDriveResponseError(response, normalized, await safeReadText(response));
    }
    const meta = (await response.json()) as DriveFileResource;
    request.reportProgress(buffered.byteLength, buffered.byteLength);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: buffered.byteLength,
      totalBytes: buffered.byteLength,
    };
    if (typeof meta.md5Checksum === "string" && meta.md5Checksum.length > 0) {
      result.checksum = meta.md5Checksum;
    }
    return result;
  }

  private async findExisting(
    parentId: string,
    name: string,
  ): Promise<DriveFileResource | undefined> {
    const q = `'${escapeDriveQ(parentId)}' in parents and name = '${escapeDriveQ(name)}' and trashed = false`;
    const response = await driveApi(
      this.options,
      "GET",
      `/files?${buildSearch({
        fields: GDRIVE_LIST_FIELDS,
        includeItemsFromAllDrives: "true",
        pageSize: "10",
        q,
        supportsAllDrives: "true",
      })}`,
    );
    const parsed = (await response.json()) as DriveListResponse;
    return parsed.files.find((f) => f.name === name);
  }
}

interface DriveFetchOptions {
  body?: Uint8Array;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

async function driveFetch(
  options: GoogleDriveSessionOptions,
  method: string,
  url: string,
  fetchOptions: DriveFetchOptions = {},
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
      () => controller.abort(new Error("Google Drive request timed out")),
      options.timeoutMs,
    );
  }
  try {
    return await options.fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ConnectionError({
      cause: error,
      details: { url },
      message: `Google Drive request to ${url} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function driveApi(
  options: GoogleDriveSessionOptions,
  method: string,
  apiPath: string,
): Promise<Response> {
  const url = `${options.apiBaseUrl}${apiPath}`;
  const response = await driveFetch(options, method, url);
  if (!response.ok) {
    const text = await safeReadText(response);
    throw mapGoogleDriveResponseError(response, apiPath, text);
  }
  return response;
}

function mapGoogleDriveResponseError(
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
      message: `Google Drive authentication failed for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `Google Drive access forbidden for ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `Google Drive path not found: ${contextPath}`,
      retryable: false,
    });
  }
  if (response.status === 429) {
    return new ConnectionError({
      details,
      message: `Google Drive rate limit hit for ${contextPath}`,
      retryable: true,
    });
  }
  return new ConnectionError({
    details,
    message: `Google Drive request for ${contextPath} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

function toRemoteEntry(file: DriveFileResource, parent: string): RemoteEntry {
  const path = joinDrivePath(parent, file.name);
  const entry: RemoteEntry = {
    name: file.name,
    path,
    raw: file,
    type: file.mimeType === GDRIVE_FOLDER_MIME ? "directory" : "file",
    uniqueId: file.id,
  };
  if (typeof file.size === "string") {
    const sized = Number(file.size);
    if (Number.isFinite(sized)) entry.size = sized;
  }
  if (typeof file.modifiedTime === "string") {
    const parsed = new Date(file.modifiedTime);
    if (!Number.isNaN(parsed.getTime())) entry.modifiedAt = parsed;
  }
  if (typeof file.createdTime === "string") {
    const parsed = new Date(file.createdTime);
    if (!Number.isNaN(parsed.getTime())) entry.createdAt = parsed;
  }
  return entry;
}

function joinDrivePath(parent: string, name: string): string {
  if (parent === "" || parent === "/") return `/${name}`;
  return parent.endsWith("/") ? `${parent}${name}` : `${parent}/${name}`;
}

function parentDir(normalized: string): string {
  if (normalized === "/" || normalized === "") return "/";
  const idx = normalized.lastIndexOf("/");
  if (idx <= 0) return "/";
  return normalized.slice(0, idx);
}

function escapeDriveQ(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function buildSearch(params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) search.set(k, v);
  return search.toString();
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
  return concatChunks(chunks, total);
}

function concatChunks(chunks: Uint8Array[], totalSize?: number): Uint8Array {
  const total = totalSize ?? chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

// `Buffer` is referenced indirectly by the shared `secretToString` helper; this
// import keeps tree-shaking simple alongside the other web providers.
void Buffer;
