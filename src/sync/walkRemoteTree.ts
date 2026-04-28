/**
 * Recursive remote-tree traversal helpers.
 *
 * @module sync/walkRemoteTree
 */
import { AbortError } from "../errors/ZeroTransferError";
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { RemoteEntry } from "../types/public";
import { joinRemotePath, normalizeRemotePath } from "../utils/path";

/** Filter callback applied to each visited entry. Returning `false` skips the entry. */
export type RemoteTreeFilter = (entry: RemoteEntry) => boolean;

/** Options accepted by {@link walkRemoteTree}. */
export interface WalkRemoteTreeOptions {
  /** Whether to descend into subdirectories. Defaults to `true`. */
  recursive?: boolean;
  /** Maximum traversal depth. `0` walks only the root listing. Unbounded by default. */
  maxDepth?: number;
  /** Whether to include directory entries in the output. Defaults to `true`. */
  includeDirectories?: boolean;
  /** Whether to include file entries in the output. Defaults to `true`. */
  includeFiles?: boolean;
  /** Whether to follow symlinks during traversal. Defaults to `false`. */
  followSymlinks?: boolean;
  /** Optional filter applied before yielding and before descending into directories. */
  filter?: RemoteTreeFilter;
  /** Optional abort signal that interrupts traversal between listings. */
  signal?: AbortSignal;
}

/** Walk record yielded by {@link walkRemoteTree}. */
export interface RemoteTreeEntry {
  /** Visited remote entry. */
  entry: RemoteEntry;
  /** Zero-based depth relative to the traversal root. */
  depth: number;
  /** Normalized parent directory path. */
  parentPath: string;
}

/**
 * Walks a remote file system depth-first, yielding entries in a stable order.
 *
 * Listings are sorted by entry path within each directory so output is deterministic
 * across providers. Errors thrown by `fs.list()` propagate; callers can supply a
 * filter to skip directories that should not be traversed.
 *
 * @param fs - Remote file system used for listings.
 * @param rootPath - Root directory to walk.
 * @param options - Optional traversal controls.
 * @returns Async generator emitting {@link RemoteTreeEntry} records.
 * @throws {@link AbortError} When the supplied abort signal is cancelled mid-walk.
 */
export async function* walkRemoteTree(
  fs: RemoteFileSystem,
  rootPath: string,
  options: WalkRemoteTreeOptions = {},
): AsyncGenerator<RemoteTreeEntry> {
  const recursive = options.recursive ?? true;
  const includeDirectories = options.includeDirectories ?? true;
  const includeFiles = options.includeFiles ?? true;
  const followSymlinks = options.followSymlinks ?? false;
  const root = normalizeRemotePath(rootPath);
  const normalized: NormalizedWalkOptions = {
    followSymlinks,
    includeDirectories,
    includeFiles,
    recursive,
  };
  if (options.maxDepth !== undefined) normalized.maxDepth = options.maxDepth;
  if (options.filter !== undefined) normalized.filter = options.filter;
  if (options.signal !== undefined) normalized.signal = options.signal;

  yield* walkDirectory(fs, root, 0, normalized);
}

interface NormalizedWalkOptions {
  recursive: boolean;
  includeDirectories: boolean;
  includeFiles: boolean;
  followSymlinks: boolean;
  maxDepth?: number;
  filter?: RemoteTreeFilter;
  signal?: AbortSignal;
}

async function* walkDirectory(
  fs: RemoteFileSystem,
  path: string,
  depth: number,
  options: NormalizedWalkOptions,
): AsyncGenerator<RemoteTreeEntry> {
  throwIfAborted(options.signal);
  const entries = await fs.list(path);
  const sorted = [...entries].sort(compareEntries);

  for (const entry of sorted) {
    if (options.filter !== undefined && !options.filter(entry)) continue;

    if (matchesEntryKind(entry, options.includeDirectories, options.includeFiles)) {
      yield { depth, entry, parentPath: path };
    }

    if (
      options.recursive &&
      canDescendInto(entry, options.followSymlinks) &&
      (options.maxDepth === undefined || depth < options.maxDepth)
    ) {
      yield* walkDirectory(fs, ensureDescendPath(entry, path), depth + 1, options);
    }
  }
}

function matchesEntryKind(
  entry: RemoteEntry,
  includeDirectories: boolean,
  includeFiles: boolean,
): boolean {
  if (entry.type === "directory") return includeDirectories;
  if (entry.type === "file") return includeFiles;
  return true;
}

function canDescendInto(entry: RemoteEntry, followSymlinks: boolean): boolean {
  if (entry.type === "directory") return true;
  return followSymlinks && entry.type === "symlink";
}

function ensureDescendPath(entry: RemoteEntry, parentPath: string): string {
  if (entry.path !== "" && entry.path !== entry.name) {
    return normalizeRemotePath(entry.path);
  }

  return joinRemotePath(parentPath, entry.name);
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  if (left.path < right.path) return -1;
  if (left.path > right.path) return 1;
  return 0;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) {
    throw new AbortError({
      message: "Remote tree walk aborted",
      retryable: false,
    });
  }
}
