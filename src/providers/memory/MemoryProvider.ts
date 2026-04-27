/**
 * Deterministic in-memory provider for contract and unit tests.
 *
 * @module providers/memory/MemoryProvider
 */
import type { CapabilitySet } from "../../core/CapabilitySet";
import type { TransferSession } from "../../core/TransferSession";
import { ConfigurationError, PathNotFoundError } from "../../errors/ZeroFTPError";
import type { ProviderFactory } from "../ProviderFactory";
import type { TransferProvider } from "../Provider";
import type { RemoteFileSystem } from "../RemoteFileSystem";
import type { RemoteEntry, RemotePermissions, RemoteStat } from "../../types/public";
import { basenameRemotePath, normalizeRemotePath } from "../../utils/path";

const MEMORY_PROVIDER_ID = "memory";

const MEMORY_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: MEMORY_PROVIDER_ID,
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
  metadata: [
    "accessedAt",
    "createdAt",
    "group",
    "modifiedAt",
    "owner",
    "permissions",
    "symlinkTarget",
    "uniqueId",
  ],
  maxConcurrency: 32,
  notes: ["Deterministic in-memory provider for tests and provider contract validation"],
};

/** Fixture entry used to seed a memory provider instance. */
export interface MemoryProviderEntry extends Omit<RemoteEntry, "name"> {
  /** Entry basename. When omitted, it is derived from `path`. */
  name?: string;
}

/** Options used to create a deterministic memory provider factory. */
export interface MemoryProviderOptions {
  /** Entries available to sessions created by this provider factory. */
  entries?: Iterable<MemoryProviderEntry>;
}

/**
 * Creates a provider factory backed by immutable in-memory fixture entries.
 *
 * @param options - Optional fixture entries to expose through the memory provider.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createMemoryProviderFactory(options: MemoryProviderOptions = {}): ProviderFactory {
  const entries = createMemoryState(options.entries ?? []);

  return {
    id: MEMORY_PROVIDER_ID,
    capabilities: MEMORY_PROVIDER_CAPABILITIES,
    create: () => new MemoryProvider(entries),
  };
}

class MemoryProvider implements TransferProvider {
  readonly id = MEMORY_PROVIDER_ID;
  readonly capabilities = MEMORY_PROVIDER_CAPABILITIES;

  constructor(private readonly entries: ReadonlyMap<string, RemoteStat>) {}

  connect(): Promise<TransferSession> {
    return Promise.resolve(new MemoryTransferSession(this.entries));
  }
}

class MemoryTransferSession implements TransferSession {
  readonly provider = MEMORY_PROVIDER_ID;
  readonly capabilities = MEMORY_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;

  constructor(entries: ReadonlyMap<string, RemoteStat>) {
    this.fs = new MemoryFileSystem(entries);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

class MemoryFileSystem implements RemoteFileSystem {
  constructor(private readonly entries: ReadonlyMap<string, RemoteStat>) {}

  list(path: string): Promise<RemoteEntry[]> {
    return Promise.resolve().then(() => {
      const normalizedPath = normalizeMemoryPath(path);
      const directory = this.requireEntry(normalizedPath);

      if (directory.type !== "directory") {
        throw createPathNotFoundError(
          normalizedPath,
          `Memory path is not a directory: ${normalizedPath}`,
        );
      }

      return [...this.entries.values()]
        .filter(
          (entry) => entry.path !== normalizedPath && getParentPath(entry.path) === normalizedPath,
        )
        .map(cloneRemoteEntry)
        .sort(compareEntries);
    });
  }

  stat(path: string): Promise<RemoteStat> {
    return Promise.resolve().then(() =>
      cloneRemoteStat(this.requireEntry(normalizeMemoryPath(path))),
    );
  }

  private requireEntry(path: string): RemoteStat {
    const entry = this.entries.get(path);

    if (entry === undefined) {
      throw createPathNotFoundError(path, `Memory path not found: ${path}`);
    }

    return entry;
  }
}

function createMemoryState(
  entries: Iterable<MemoryProviderEntry>,
): ReadonlyMap<string, RemoteStat> {
  const state = new Map<string, RemoteStat>([["/", createDirectoryEntry("/")]]);

  for (const input of entries) {
    const entry = createMemoryEntry(input);

    if (entry.path === "/" && entry.type !== "directory") {
      throw createInvalidFixtureError(entry.path, "Memory provider root must be a directory");
    }

    ensureParentDirectories(state, entry.path);
    state.set(entry.path, entry);
  }

  return state;
}

function createMemoryEntry(input: MemoryProviderEntry): RemoteStat {
  const path = normalizeMemoryPath(input.path);
  const entry: RemoteEntry = {
    name: input.name ?? basenameRemotePath(path),
    path,
    type: input.type,
  };

  copyOptionalEntryFields(entry, input);

  return {
    ...entry,
    exists: true,
  };
}

function createDirectoryEntry(path: string): RemoteStat {
  return {
    exists: true,
    name: basenameRemotePath(path),
    path,
    type: "directory",
  };
}

function ensureParentDirectories(state: Map<string, RemoteStat>, path: string): void {
  for (const parentPath of getAncestorPaths(path)) {
    const parent = state.get(parentPath);

    if (parent !== undefined && parent.type !== "directory") {
      throw createInvalidFixtureError(
        parentPath,
        `Memory fixture parent is not a directory: ${parentPath}`,
      );
    }

    if (parent === undefined) {
      state.set(parentPath, createDirectoryEntry(parentPath));
    }
  }
}

function normalizeMemoryPath(path: string): string {
  const normalized = normalizeRemotePath(path);

  if (normalized === "." || normalized === "/") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getAncestorPaths(path: string): string[] {
  const ancestors: string[] = [];
  let parentPath = getParentPath(path);

  while (parentPath !== undefined && parentPath !== "/") {
    ancestors.unshift(parentPath);
    parentPath = getParentPath(parentPath);
  }

  return ancestors;
}

function getParentPath(path: string): string | undefined {
  if (path === "/") {
    return undefined;
  }

  const parentEnd = path.lastIndexOf("/");
  return parentEnd <= 0 ? "/" : path.slice(0, parentEnd);
}

function cloneRemoteEntry(entry: RemoteEntry): RemoteEntry {
  const clone: RemoteEntry = {
    name: entry.name,
    path: entry.path,
    type: entry.type,
  };

  copyOptionalEntryFields(clone, entry);
  return clone;
}

function cloneRemoteStat(entry: RemoteStat): RemoteStat {
  return {
    ...cloneRemoteEntry(entry),
    exists: true,
  };
}

function copyOptionalEntryFields(target: RemoteEntry, source: Partial<RemoteEntry>): void {
  if (source.size !== undefined) target.size = source.size;
  if (source.modifiedAt !== undefined) target.modifiedAt = cloneDate(source.modifiedAt);
  if (source.createdAt !== undefined) target.createdAt = cloneDate(source.createdAt);
  if (source.accessedAt !== undefined) target.accessedAt = cloneDate(source.accessedAt);
  if (source.permissions !== undefined) target.permissions = clonePermissions(source.permissions);
  if (source.owner !== undefined) target.owner = source.owner;
  if (source.group !== undefined) target.group = source.group;
  if (source.symlinkTarget !== undefined) target.symlinkTarget = source.symlinkTarget;
  if (source.uniqueId !== undefined) target.uniqueId = source.uniqueId;
  if (source.raw !== undefined) target.raw = source.raw;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function clonePermissions(permissions: RemotePermissions): RemotePermissions {
  return { ...permissions };
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

function createPathNotFoundError(path: string, message: string): PathNotFoundError {
  return new PathNotFoundError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path,
    retryable: false,
  });
}

function createInvalidFixtureError(path: string, message: string): ConfigurationError {
  return new ConfigurationError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path,
    retryable: false,
  });
}
