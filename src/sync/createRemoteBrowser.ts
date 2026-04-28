/**
 * Browser-friendly directory navigation helpers for file-manager UIs.
 *
 * Wraps a {@link RemoteFileSystem} with stateful current-directory tracking,
 * breadcrumb generation, and pure sort/filter utilities so consumers can render
 * directory views without re-implementing common navigation glue.
 *
 * @module sync/createRemoteBrowser
 */
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { RemoteEntry } from "../types/public";
import { normalizeRemotePath } from "../utils/path";

/** Sort key supported by {@link sortRemoteEntries}. */
export type RemoteEntrySortKey = "name" | "size" | "modifiedAt" | "type";

/** Sort direction supported by {@link sortRemoteEntries}. */
export type RemoteEntrySortOrder = "asc" | "desc";

/** Crumb describing one segment in the current path. */
export interface RemoteBreadcrumb {
  /** Display name. `""` is replaced with `"/"` for the root crumb. */
  name: string;
  /** Absolute path the crumb resolves to. */
  path: string;
}

/** Filter callback applied to a directory listing. */
export type RemoteBrowserFilter = (entry: RemoteEntry) => boolean;

/** Options accepted by {@link createRemoteBrowser}. */
export interface CreateRemoteBrowserOptions {
  /** Remote file system to browse. */
  fs: RemoteFileSystem;
  /** Initial path. Defaults to `"/"`. */
  initialPath?: string;
  /** Sort key applied to listings. Defaults to `"name"`. */
  sortKey?: RemoteEntrySortKey;
  /** Sort order applied to listings. Defaults to `"asc"`. */
  sortOrder?: RemoteEntrySortOrder;
  /** Whether dotfile entries (names starting with `.`) are included. Defaults to `true`. */
  showHidden?: boolean;
  /** Optional filter applied after sort/hidden filtering. */
  filter?: RemoteBrowserFilter;
}

/** Snapshot returned by browser navigation methods. */
export interface RemoteBrowserSnapshot {
  /** Current absolute path. */
  path: string;
  /** Directory entries after sorting and filtering. */
  entries: RemoteEntry[];
  /** Breadcrumb trail leading from `/` to {@link path}. */
  breadcrumbs: RemoteBreadcrumb[];
}

/** Stateful directory browser returned by {@link createRemoteBrowser}. */
export interface RemoteBrowser {
  /** Current absolute path. */
  readonly path: string;
  /** Last loaded sorted/filtered entries. */
  readonly entries: readonly RemoteEntry[];
  /** Reload the current directory and return the latest snapshot. */
  refresh(): Promise<RemoteBrowserSnapshot>;
  /** Navigate to the supplied absolute or relative path. */
  navigate(target: string): Promise<RemoteBrowserSnapshot>;
  /** Descend into the supplied directory entry. Throws when the entry is not a directory. */
  open(entry: RemoteEntry): Promise<RemoteBrowserSnapshot>;
  /** Move to the parent directory; no-op when already at the root. */
  up(): Promise<RemoteBrowserSnapshot>;
  /** Compute breadcrumbs for the current path without re-listing. */
  breadcrumbs(): RemoteBreadcrumb[];
  /** Update the sort key. The next refresh re-sorts the cached entries. */
  setSort(key: RemoteEntrySortKey, order?: RemoteEntrySortOrder): void;
  /** Toggle hidden-entry visibility. The next refresh re-applies the filter. */
  setShowHidden(showHidden: boolean): void;
}

/**
 * Returns the parent directory of a remote path, or `"/"` for root inputs.
 *
 * @param input - Remote path to inspect.
 * @returns The parent path normalized to an absolute form.
 */
export function parentRemotePath(input: string): string {
  const normalized = normalizeRemotePath(input);
  if (normalized === "/") return "/";
  const parts = normalized.split("/").filter(Boolean);
  parts.pop();
  if (parts.length === 0) return "/";
  return `/${parts.join("/")}`;
}

/**
 * Builds breadcrumbs from `/` down to the supplied path.
 *
 * @param input - Absolute remote path.
 * @returns Ordered crumbs starting with the root.
 */
export function buildRemoteBreadcrumbs(input: string): RemoteBreadcrumb[] {
  const normalized = normalizeRemotePath(input);
  const crumbs: RemoteBreadcrumb[] = [{ name: "/", path: "/" }];
  if (normalized === "/") return crumbs;

  const parts = normalized.split("/").filter(Boolean);
  let cursor = "";
  for (const part of parts) {
    cursor += `/${part}`;
    crumbs.push({ name: part, path: cursor });
  }
  return crumbs;
}

/**
 * Returns a copy of the supplied entries sorted by the requested key. Directories
 * are grouped before files within ascending sorts, matching common file-manager UX.
 *
 * @param entries - Entries to sort.
 * @param key - Sort key.
 * @param order - Sort order.
 * @returns Sorted copy of the entries.
 */
export function sortRemoteEntries(
  entries: readonly RemoteEntry[],
  key: RemoteEntrySortKey = "name",
  order: RemoteEntrySortOrder = "asc",
): RemoteEntry[] {
  const direction = order === "asc" ? 1 : -1;
  return [...entries].sort((left, right) => {
    if (key !== "type") {
      const leftIsDir = left.type === "directory";
      const rightIsDir = right.type === "directory";
      if (leftIsDir !== rightIsDir) return leftIsDir ? -1 : 1;
    }

    const compared = compareEntriesByKey(left, right, key);
    if (compared !== 0) return compared * direction;
    return compareNames(left, right);
  });
}

/**
 * Filters entries using the optional predicate plus an optional hidden-file rule.
 *
 * @param entries - Entries to filter.
 * @param options - Filtering controls.
 * @returns Entries matching the supplied rules.
 */
export function filterRemoteEntries(
  entries: readonly RemoteEntry[],
  options: { filter?: RemoteBrowserFilter; showHidden?: boolean } = {},
): RemoteEntry[] {
  const showHidden = options.showHidden ?? true;
  const filter = options.filter;
  return entries.filter((entry) => {
    if (!showHidden && entry.name.startsWith(".")) return false;
    if (filter !== undefined && !filter(entry)) return false;
    return true;
  });
}

/**
 * Creates a stateful directory browser around a remote file system.
 *
 * The returned browser caches the most recent listing and applies sort/filter
 * settings on each refresh. Navigation methods return a snapshot so UI layers can
 * render synchronously without re-reading state.
 *
 * @param options - Browser configuration.
 * @returns Stateful browser bound to the supplied file system.
 */
export function createRemoteBrowser(options: CreateRemoteBrowserOptions): RemoteBrowser {
  const { fs } = options;
  let currentPath = normalizeRemotePath(options.initialPath ?? "/");
  let cachedEntries: RemoteEntry[] = [];
  let sortKey: RemoteEntrySortKey = options.sortKey ?? "name";
  let sortOrder: RemoteEntrySortOrder = options.sortOrder ?? "asc";
  let showHidden = options.showHidden ?? true;
  const filter = options.filter;

  async function loadCurrent(): Promise<RemoteBrowserSnapshot> {
    const raw = await fs.list(currentPath);
    const projected = projectEntries(raw);
    cachedEntries = projected;
    return snapshot();
  }

  function projectEntries(raw: readonly RemoteEntry[]): RemoteEntry[] {
    const filterOptions: { filter?: RemoteBrowserFilter; showHidden: boolean } = { showHidden };
    if (filter !== undefined) filterOptions.filter = filter;
    const filtered = filterRemoteEntries(raw, filterOptions);
    return sortRemoteEntries(filtered, sortKey, sortOrder);
  }

  function snapshot(): RemoteBrowserSnapshot {
    return {
      breadcrumbs: buildRemoteBreadcrumbs(currentPath),
      entries: [...cachedEntries],
      path: currentPath,
    };
  }

  async function navigate(target: string): Promise<RemoteBrowserSnapshot> {
    currentPath = resolveTarget(currentPath, target);
    return loadCurrent();
  }

  async function open(entry: RemoteEntry): Promise<RemoteBrowserSnapshot> {
    if (entry.type !== "directory") {
      throw new TypeError(
        `Cannot open non-directory entry "${entry.path}" (type: ${entry.type})`,
      );
    }
    return navigate(entry.path);
  }

  return {
    breadcrumbs: () => buildRemoteBreadcrumbs(currentPath),
    get entries() {
      return cachedEntries;
    },
    navigate,
    open,
    get path() {
      return currentPath;
    },
    refresh: loadCurrent,
    setShowHidden(value: boolean) {
      showHidden = value;
    },
    setSort(key: RemoteEntrySortKey, order: RemoteEntrySortOrder = sortOrder) {
      sortKey = key;
      sortOrder = order;
    },
    up: () => navigate(parentRemotePath(currentPath)),
  };
}

function resolveTarget(currentPath: string, target: string): string {
  if (target.startsWith("/")) return normalizeRemotePath(target);
  if (target === "" || target === ".") return currentPath;
  if (target === "..") return parentRemotePath(currentPath);
  const base = currentPath === "/" ? "" : currentPath;
  return normalizeRemotePath(`${base}/${target}`);
}

function compareEntriesByKey(
  left: RemoteEntry,
  right: RemoteEntry,
  key: RemoteEntrySortKey,
): number {
  switch (key) {
    case "size":
      return (left.size ?? 0) - (right.size ?? 0);
    case "modifiedAt": {
      const leftTime = left.modifiedAt?.getTime() ?? 0;
      const rightTime = right.modifiedAt?.getTime() ?? 0;
      return leftTime - rightTime;
    }
    case "type":
      return left.type.localeCompare(right.type);
    case "name":
    default:
      return compareNames(left, right);
  }
}

function compareNames(left: RemoteEntry, right: RemoteEntry): number {
  return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" });
}
