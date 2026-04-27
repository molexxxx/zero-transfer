/**
 * Local file-system provider for deterministic provider contract coverage.
 *
 * @module providers/local/LocalProvider
 */
import { lstat, readdir, readlink } from "node:fs/promises";
import path from "node:path";
import type { Stats } from "node:fs";
import type { CapabilitySet } from "../../core/CapabilitySet";
import type { TransferSession } from "../../core/TransferSession";
import {
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
} from "../../errors/ZeroFTPError";
import type {
  ConnectionProfile,
  RemoteEntry,
  RemoteEntryType,
  RemoteStat,
} from "../../types/public";
import { basenameRemotePath, joinRemotePath, normalizeRemotePath } from "../../utils/path";
import type { TransferProvider } from "../Provider";
import type { ProviderFactory } from "../ProviderFactory";
import type { RemoteFileSystem } from "../RemoteFileSystem";

const LOCAL_PROVIDER_ID = "local";

const LOCAL_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: LOCAL_PROVIDER_ID,
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: false,
  writeStream: false,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: false,
  resumeUpload: false,
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
 * @param options - Optional local root path exposed through provider sessions.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
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

  constructor(rootPath: string) {
    this.fs = new LocalFileSystem(rootPath);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
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
