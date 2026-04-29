/**
 * Local file-system provider for deterministic provider contract coverage.
 *
 * @module providers/local/LocalProvider
 */
import { createReadStream } from "node:fs";
import { lstat, mkdir, open, readdir, readlink, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Buffer } from "node:buffer";
import type { Stats } from "node:fs";
import type { CapabilitySet } from "../../core/CapabilitySet";
import type { TransferSession } from "../../core/TransferSession";
import {
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
} from "../../errors/ZeroTransferError";
import type { TransferVerificationResult } from "../../transfers/TransferJob";
import type {
  ConnectionProfile,
  MkdirOptions,
  RemoteEntry,
  RemoteEntryType,
  RemoteStat,
  RemoveOptions,
  RmdirOptions,
} from "../../types/public";
import { basenameRemotePath, joinRemotePath, normalizeRemotePath } from "../../utils/path";
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

const LOCAL_PROVIDER_ID = "local";

const LOCAL_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: LOCAL_PROVIDER_ID,
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: true,
  resumeUpload: true,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: ["accessedAt", "createdAt", "modifiedAt", "permissions", "symlinkTarget", "uniqueId"],
  maxConcurrency: 16,
  notes: ["Local filesystem provider for tests and local-only workflows"],
};

/** Options used to create a local file-system provider factory. */
export interface LocalProviderOptions {
  /** Root directory exposed as `/`. When omitted, `profile.host` is treated as the root path. */
  rootPath?: string;
}

/**
 * Creates a provider factory backed by the local filesystem.
 *
 * Useful for copying files between two remote endpoints via a local staging
 * area, or as the destination for `downloadFile`. The friendly `uploadFile`
 * helper registers a local provider implicitly.
 *
 * @param options - Optional local root path exposed through provider sessions.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example Use a fixed root directory
 * ```ts
 * import { createLocalProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createLocalProviderFactory({ rootPath: "/var/lib/zt-staging" })],
 * });
 *
 * const session = await client.connect({ host: "staging", provider: "local" });
 * const list = await session.fs.list("/");
 * ```
 */
export function createLocalProviderFactory(options: LocalProviderOptions = {}): ProviderFactory {
  return {
    id: LOCAL_PROVIDER_ID,
    capabilities: LOCAL_PROVIDER_CAPABILITIES,
    create: () => new LocalProvider(options.rootPath),
  };
}

class LocalProvider implements TransferProvider {
  readonly id = LOCAL_PROVIDER_ID;
  readonly capabilities = LOCAL_PROVIDER_CAPABILITIES;

  constructor(private readonly configuredRootPath: string | undefined) {}

  connect(profile: ConnectionProfile): Promise<TransferSession> {
    return Promise.resolve().then(() => {
      const rootPath = path.resolve(this.configuredRootPath ?? profile.host);
      return new LocalTransferSession(rootPath);
    });
  }
}

class LocalTransferSession implements TransferSession {
  readonly provider = LOCAL_PROVIDER_ID;
  readonly capabilities = LOCAL_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(rootPath: string) {
    this.fs = new LocalFileSystem(rootPath);
    this.transfers = new LocalTransferOperations(rootPath);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class LocalTransferOperations implements ProviderTransferOperations {
  constructor(private readonly rootPath: string) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const remotePath = normalizeLocalProviderPath(request.endpoint.path);
    const entry = await readLocalEntry(this.rootPath, remotePath);

    if (entry.type !== "file") {
      throw createPathNotFoundError(remotePath, `Local provider path is not a file: ${remotePath}`);
    }

    const range = resolveReadRange(entry.size ?? 0, request.range);
    const result: ProviderTransferReadResult = {
      content: createLocalReadSource(resolveLocalPath(this.rootPath, remotePath), range),
      totalBytes: range.length,
    };

    if (range.offset > 0) {
      result.bytesRead = range.offset;
    }

    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const remotePath = normalizeLocalProviderPath(request.endpoint.path);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    const content = await collectTransferContent(request);
    const offset = normalizeOptionalByteCount(request.offset, "offset", remotePath);

    await ensureLocalParentDirectory(localPath, remotePath);
    await writeLocalContent(localPath, remotePath, content, offset);

    const stat = await readLocalEntry(this.rootPath, remotePath);
    const result: ProviderTransferWriteResult = {
      bytesTransferred: content.byteLength,
      resumed: offset !== undefined && offset > 0,
      verified: request.verification?.verified ?? false,
    };

    if (stat.size !== undefined) {
      result.totalBytes = stat.size;
    }

    if (request.verification !== undefined) {
      result.verification = cloneVerification(request.verification);
    }

    return result;
  }
}

class LocalFileSystem implements RemoteFileSystem {
  constructor(private readonly rootPath: string) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const remotePath = normalizeLocalProviderPath(path);
    const directory = await this.stat(remotePath);

    if (directory.type !== "directory") {
      throw createPathNotFoundError(
        remotePath,
        `Local provider path is not a directory: ${remotePath}`,
      );
    }

    const localPath = resolveLocalPath(this.rootPath, remotePath);
    const names = await readLocalDirectory(localPath, remotePath);
    const entries = await Promise.all(
      names.map((name) => readLocalEntry(this.rootPath, joinRemotePath(remotePath, name))),
    );

    return entries.sort(compareEntries);
  }

  async stat(path: string): Promise<RemoteStat> {
    return readLocalEntry(this.rootPath, normalizeLocalProviderPath(path));
  }

  async remove(remote: string, options: RemoveOptions = {}): Promise<void> {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    try {
      await unlink(localPath);
    } catch (error) {
      if (options.ignoreMissing && isNodeErrno(error, "ENOENT")) return;
      if (isNodeErrno(error, "ENOENT")) {
        throw createPathNotFoundError(remotePath, `Local path not found: ${remotePath}`);
      }
      throw error;
    }
  }

  async rename(from: string, to: string): Promise<void> {
    const fromRemote = normalizeLocalProviderPath(from);
    const toRemote = normalizeLocalProviderPath(to);
    const fromLocal = resolveLocalPath(this.rootPath, fromRemote);
    const toLocal = resolveLocalPath(this.rootPath, toRemote);
    try {
      await rename(fromLocal, toLocal);
    } catch (error) {
      if (isNodeErrno(error, "ENOENT")) {
        throw createPathNotFoundError(fromRemote, `Local path not found: ${fromRemote}`);
      }
      throw error;
    }
  }

  async mkdir(remote: string, options: MkdirOptions = {}): Promise<void> {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    await mkdir(localPath, { recursive: options.recursive === true });
  }

  async rmdir(remote: string, options: RmdirOptions = {}): Promise<void> {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    try {
      await rm(localPath, { recursive: options.recursive === true, force: false });
    } catch (error) {
      if (isNodeErrno(error, "ENOENT")) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError(remotePath, `Local path not found: ${remotePath}`);
      }
      throw error;
    }
  }
}

function isNodeErrno(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

interface ResolvedReadRange {
  offset: number;
  length: number;
}

function resolveReadRange(
  size: number,
  range: ProviderTransferReadRequest["range"],
): ResolvedReadRange {
  if (range === undefined) {
    return { length: size, offset: 0 };
  }

  const requestedOffset = normalizeByteCount(range.offset, "offset", "/");
  const requestedLength =
    range.length === undefined
      ? size - Math.min(requestedOffset, size)
      : normalizeByteCount(range.length, "length", "/");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));

  return { length, offset };
}

async function* createLocalReadSource(
  localPath: string,
  range: ResolvedReadRange,
): AsyncGenerator<Uint8Array> {
  if (range.length <= 0) {
    return;
  }

  const stream = createReadStream(localPath, {
    end: range.offset + range.length - 1,
    start: range.offset,
  }) as AsyncIterable<Buffer>;

  for await (const chunk of stream) {
    yield new Uint8Array(chunk);
  }
}

async function collectTransferContent(request: ProviderTransferWriteRequest): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  for await (const chunk of request.content) {
    request.throwIfAborted();
    const clonedChunk = new Uint8Array(chunk);
    chunks.push(clonedChunk);
    byteLength += clonedChunk.byteLength;
    request.reportProgress(byteLength, request.totalBytes);
  }

  return concatChunks(chunks, byteLength);
}

function concatChunks(chunks: Uint8Array[], byteLength: number): Uint8Array {
  const content = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return content;
}

async function ensureLocalParentDirectory(localPath: string, remotePath: string): Promise<void> {
  try {
    await mkdir(path.dirname(localPath), { recursive: true });
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}

async function writeLocalContent(
  localPath: string,
  remotePath: string,
  content: Uint8Array,
  offset: number | undefined,
): Promise<void> {
  try {
    if (offset === undefined) {
      await writeFile(localPath, content);
      return;
    }

    const handle = await openLocalFileForOffsetWrite(localPath);

    try {
      await handle.write(content, 0, content.byteLength, offset);
    } finally {
      await handle.close();
    }
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}

async function openLocalFileForOffsetWrite(localPath: string) {
  try {
    return await open(localPath, "r+");
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return open(localPath, "w+");
    }

    throw error;
  }
}

function normalizeOptionalByteCount(
  value: number | undefined,
  field: string,
  remotePath: string,
): number | undefined {
  return value === undefined ? undefined : normalizeByteCount(value, field, remotePath);
}

function normalizeByteCount(value: number, field: string, remotePath: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field, provider: LOCAL_PROVIDER_ID },
      message: `Local provider ${field} must be a non-negative number`,
      path: remotePath,
      retryable: false,
    });
  }

  return Math.floor(value);
}

function cloneVerification(verification: TransferVerificationResult): TransferVerificationResult {
  const clone: TransferVerificationResult = { verified: verification.verified };

  if (verification.method !== undefined) clone.method = verification.method;
  if (verification.checksum !== undefined) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== undefined) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== undefined) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== undefined) clone.details = { ...verification.details };

  return clone;
}

async function readLocalDirectory(localPath: string, remotePath: string): Promise<string[]> {
  try {
    return await readdir(localPath);
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}

async function readLocalEntry(rootPath: string, remotePath: string): Promise<RemoteStat> {
  const localPath = resolveLocalPath(rootPath, remotePath);
  let stats: Stats;

  try {
    stats = await lstat(localPath);
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }

  const entry: RemoteEntry = {
    accessedAt: cloneDate(stats.atime),
    createdAt: cloneDate(stats.birthtime),
    modifiedAt: cloneDate(stats.mtime),
    name: basenameRemotePath(remotePath),
    path: remotePath,
    permissions: { raw: formatMode(stats.mode) },
    size: stats.size,
    type: getLocalEntryType(stats),
    uniqueId: `${stats.dev}:${stats.ino}`,
  };

  if (entry.type === "symlink") {
    const symlinkTarget = await readSymlinkTarget(localPath);

    if (symlinkTarget !== undefined) {
      entry.symlinkTarget = symlinkTarget;
    }
  }

  return {
    ...entry,
    exists: true,
  };
}

async function readSymlinkTarget(localPath: string): Promise<string | undefined> {
  try {
    return await readlink(localPath);
  } catch {
    return undefined;
  }
}

function normalizeLocalProviderPath(input: string): string {
  const normalized = normalizeRemotePath(input);

  if (normalized === ".." || normalized.startsWith("../")) {
    throw new ConfigurationError({
      details: { provider: LOCAL_PROVIDER_ID },
      message: `Local provider path escapes the configured root: ${normalized}`,
      path: normalized,
      retryable: false,
    });
  }

  if (normalized === "." || normalized === "/") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function resolveLocalPath(rootPath: string, remotePath: string): string {
  const normalizedRemotePath = normalizeLocalProviderPath(remotePath);

  // If the remote path is already an absolute filesystem path inside rootPath
  // (e.g. friendly upload/download passes the host path as the endpoint path),
  // honour it directly instead of double-prepending rootPath.
  const resolvedRootPath = path.resolve(rootPath);
  const candidateAbsolute = path.resolve(normalizedRemotePath.split("/").join(path.sep));
  if (
    candidateAbsolute === resolvedRootPath ||
    candidateAbsolute.startsWith(resolvedRootPath + path.sep)
  ) {
    return candidateAbsolute;
  }

  const relativePath = normalizedRemotePath === "/" ? "." : normalizedRemotePath.slice(1);
  const resolvedPath = path.resolve(rootPath, relativePath.split("/").join(path.sep));
  const relativeToRoot = path.relative(rootPath, resolvedPath);

  if (
    relativeToRoot === "" ||
    (!relativeToRoot.startsWith("..") && !path.isAbsolute(relativeToRoot))
  ) {
    return resolvedPath;
  }

  throw new ConfigurationError({
    details: { provider: LOCAL_PROVIDER_ID, rootPath },
    message: `Local provider path escapes the configured root: ${normalizedRemotePath}`,
    path: normalizedRemotePath,
    retryable: false,
  });
}

function getLocalEntryType(stats: Stats): RemoteEntryType {
  if (stats.isFile()) return "file";
  if (stats.isDirectory()) return "directory";
  if (stats.isSymbolicLink()) return "symlink";
  return "unknown";
}

function formatMode(mode: number): string {
  return (mode & 0o777).toString(8).padStart(3, "0");
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

function mapLocalFileSystemError(error: unknown, remotePath: string): Error {
  const code = getErrorCode(error);

  if (code === "ENOENT" || code === "ENOTDIR") {
    return createPathNotFoundError(remotePath, `Local provider path not found: ${remotePath}`);
  }

  if (code === "EACCES" || code === "EPERM") {
    return new PermissionDeniedError({
      cause: error,
      details: { provider: LOCAL_PROVIDER_ID },
      message: `Local provider permission denied: ${remotePath}`,
      path: remotePath,
      retryable: false,
    });
  }

  return new ConfigurationError({
    cause: error,
    details: { code, provider: LOCAL_PROVIDER_ID },
    message: `Local provider filesystem operation failed: ${remotePath}`,
    path: remotePath,
    retryable: false,
  });
}

function createPathNotFoundError(path: string, message: string): PathNotFoundError {
  return new PathNotFoundError({
    details: { provider: LOCAL_PROVIDER_ID },
    message,
    path,
    retryable: false,
  });
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}
