/**
 * Directory diffing primitives that compare two remote trees.
 *
 * @module sync/diffRemoteTrees
 */
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { RemoteEntry } from "../types/public";
import { normalizeRemotePath } from "../utils/path";
import { walkRemoteTree, type RemoteTreeFilter, type WalkRemoteTreeOptions } from "./walkRemoteTree";

/** Outcome category for an entry across the two compared trees. */
export type RemoteTreeDiffStatus = "added" | "removed" | "modified" | "unchanged";

/** Reason an entry is considered modified. */
export type RemoteTreeDiffReason = "type" | "size" | "modifiedAt" | "checksum";

/** Single diff record produced by {@link diffRemoteTrees}. */
export interface RemoteTreeDiffEntry {
  /** Path relative to the traversal root, beginning with `/`. */
  path: string;
  /** Outcome category for this entry. */
  status: RemoteTreeDiffStatus;
  /** Reasons the entry is considered modified. Empty for unchanged/added/removed records. */
  reasons: RemoteTreeDiffReason[];
  /** Source-side entry, when present. */
  source?: RemoteEntry;
  /** Destination-side entry, when present. */
  destination?: RemoteEntry;
}

/** Compact summary of a diff result. */
export interface RemoteTreeDiffSummary {
  /** Number of entries present only on the source side. */
  added: number;
  /** Number of entries present only on the destination side. */
  removed: number;
  /** Number of entries present on both sides whose contents differ. */
  modified: number;
  /** Number of entries present on both sides with identical contents. */
  unchanged: number;
  /** Total entries inspected across both sides. */
  total: number;
}

/** Result returned by {@link diffRemoteTrees}. */
export interface RemoteTreeDiff {
  /** Diff records sorted by path. */
  entries: RemoteTreeDiffEntry[];
  /** Compact counts for the diff. */
  summary: RemoteTreeDiffSummary;
}

/** Options accepted by {@link diffRemoteTrees}. */
export interface DiffRemoteTreesOptions {
  /** Optional traversal controls applied to both sides. */
  walk?: Pick<
    WalkRemoteTreeOptions,
    | "filter"
    | "followSymlinks"
    | "includeDirectories"
    | "includeFiles"
    | "maxDepth"
    | "recursive"
  >;
  /** Filter applied only to the source side. Overrides `walk.filter` when set. */
  sourceFilter?: RemoteTreeFilter;
  /** Filter applied only to the destination side. Overrides `walk.filter` when set. */
  destinationFilter?: RemoteTreeFilter;
  /** Whether unchanged entries are included in `entries`. Defaults to `false`. */
  includeUnchanged?: boolean;
  /** Tolerance in milliseconds when comparing modification timestamps. Defaults to `1000`. */
  modifiedAtToleranceMs?: number;
  /** Whether modification timestamps participate in the comparison. Defaults to `true`. */
  compareModifiedAt?: boolean;
  /** Whether sizes participate in the comparison. Defaults to `true`. */
  compareSize?: boolean;
  /** Whether to require matching `uniqueId` checksums when both entries expose one. Defaults to `false`. */
  compareUniqueId?: boolean;
  /** Optional abort signal threaded through both walks. */
  signal?: AbortSignal;
}

/**
 * Compares two remote subtrees and produces an entry-level diff.
 *
 * Source and destination paths are walked independently; entries are then aligned by
 * the relative path from each tree root. Directory equality is structural — directories
 * are equal when their relative paths match and the entry types agree.
 *
 * @param source - Source-side remote file system.
 * @param sourcePath - Source-side root path being compared.
 * @param destination - Destination-side remote file system.
 * @param destinationPath - Destination-side root path being compared.
 * @param options - Optional comparison controls.
 * @returns Diff result containing entries and a summary.
 */
export async function diffRemoteTrees(
  source: RemoteFileSystem,
  sourcePath: string,
  destination: RemoteFileSystem,
  destinationPath: string,
  options: DiffRemoteTreesOptions = {},
): Promise<RemoteTreeDiff> {
  const includeUnchanged = options.includeUnchanged ?? false;
  const sourceRoot = normalizeRemotePath(sourcePath);
  const destinationRoot = normalizeRemotePath(destinationPath);
  const sourceWalk = createWalkOptions(options, options.sourceFilter);
  const destinationWalk = createWalkOptions(options, options.destinationFilter);

  const [sourceEntries, destinationEntries] = await Promise.all([
    collectEntries(source, sourceRoot, sourceWalk),
    collectEntries(destination, destinationRoot, destinationWalk),
  ]);

  const aligned = alignEntries(sourceEntries, destinationEntries);
  const entries: RemoteTreeDiffEntry[] = [];
  const summary: RemoteTreeDiffSummary = {
    added: 0,
    modified: 0,
    removed: 0,
    total: 0,
    unchanged: 0,
  };

  for (const { path, source: sourceEntry, destination: destinationEntry } of aligned) {
    summary.total += 1;
    const reasons: RemoteTreeDiffReason[] = [];
    let status: RemoteTreeDiffStatus;

    if (sourceEntry !== undefined && destinationEntry === undefined) {
      status = "added";
      summary.added += 1;
    } else if (sourceEntry === undefined && destinationEntry !== undefined) {
      status = "removed";
      summary.removed += 1;
    } else if (sourceEntry !== undefined && destinationEntry !== undefined) {
      const computedReasons = compareEntries(sourceEntry, destinationEntry, options);

      if (computedReasons.length === 0) {
        status = "unchanged";
        summary.unchanged += 1;
      } else {
        status = "modified";
        reasons.push(...computedReasons);
        summary.modified += 1;
      }
    } else {
      // Both entries undefined cannot happen because alignEntries only emits aligned pairs.
      continue;
    }

    if (status === "unchanged" && !includeUnchanged) continue;

    const record: RemoteTreeDiffEntry = { path, reasons, status };
    if (sourceEntry !== undefined) record.source = sourceEntry;
    if (destinationEntry !== undefined) record.destination = destinationEntry;
    entries.push(record);
  }

  entries.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));

  return { entries, summary };
}

function createWalkOptions(
  options: DiffRemoteTreesOptions,
  filter: RemoteTreeFilter | undefined,
): WalkRemoteTreeOptions {
  const walk = options.walk ?? {};
  const merged: WalkRemoteTreeOptions = {};

  if (walk.recursive !== undefined) merged.recursive = walk.recursive;
  if (walk.maxDepth !== undefined) merged.maxDepth = walk.maxDepth;
  if (walk.includeDirectories !== undefined) merged.includeDirectories = walk.includeDirectories;
  if (walk.includeFiles !== undefined) merged.includeFiles = walk.includeFiles;
  if (walk.followSymlinks !== undefined) merged.followSymlinks = walk.followSymlinks;
  const resolvedFilter = filter ?? walk.filter;
  if (resolvedFilter !== undefined) merged.filter = resolvedFilter;
  if (options.signal !== undefined) merged.signal = options.signal;

  return merged;
}

interface CollectedEntry {
  relativePath: string;
  entry: RemoteEntry;
}

async function collectEntries(
  fs: RemoteFileSystem,
  rootPath: string,
  walkOptions: WalkRemoteTreeOptions,
): Promise<Map<string, RemoteEntry>> {
  const map = new Map<string, RemoteEntry>();

  for await (const record of walkRemoteTree(fs, rootPath, walkOptions)) {
    const collected = toCollectedEntry(record.entry, rootPath);
    if (collected !== undefined) map.set(collected.relativePath, collected.entry);
  }

  return map;
}

function toCollectedEntry(entry: RemoteEntry, rootPath: string): CollectedEntry | undefined {
  const root = normalizeRemotePath(rootPath);
  const path = normalizeRemotePath(entry.path);

  if (path === root) return undefined;
  if (root === "/") return { entry, relativePath: path };
  if (path.startsWith(`${root}/`)) {
    return { entry, relativePath: path.slice(root.length) };
  }

  return undefined;
}

interface AlignedPair {
  path: string;
  source?: RemoteEntry;
  destination?: RemoteEntry;
}

function alignEntries(
  sourceEntries: Map<string, RemoteEntry>,
  destinationEntries: Map<string, RemoteEntry>,
): AlignedPair[] {
  const paths = new Set<string>([...sourceEntries.keys(), ...destinationEntries.keys()]);
  const aligned: AlignedPair[] = [];

  for (const path of paths) {
    const pair: AlignedPair = { path };
    const source = sourceEntries.get(path);
    const destination = destinationEntries.get(path);

    if (source !== undefined) pair.source = source;
    if (destination !== undefined) pair.destination = destination;
    aligned.push(pair);
  }

  return aligned;
}

function compareEntries(
  source: RemoteEntry,
  destination: RemoteEntry,
  options: DiffRemoteTreesOptions,
): RemoteTreeDiffReason[] {
  const reasons: RemoteTreeDiffReason[] = [];
  const compareSize = options.compareSize ?? true;
  const compareModifiedAt = options.compareModifiedAt ?? true;
  const compareUniqueId = options.compareUniqueId ?? false;
  const tolerance = options.modifiedAtToleranceMs ?? 1000;

  if (source.type !== destination.type) {
    reasons.push("type");
  }

  if (compareSize && isSizeRelevant(source, destination) && source.size !== destination.size) {
    reasons.push("size");
  }

  if (compareModifiedAt && isModifiedAtDifferent(source, destination, tolerance)) {
    reasons.push("modifiedAt");
  }

  if (
    compareUniqueId &&
    source.uniqueId !== undefined &&
    destination.uniqueId !== undefined &&
    source.uniqueId !== destination.uniqueId
  ) {
    reasons.push("checksum");
  }

  return reasons;
}

function isSizeRelevant(source: RemoteEntry, destination: RemoteEntry): boolean {
  if (source.type !== "file" || destination.type !== "file") return false;
  return source.size !== undefined && destination.size !== undefined;
}

function isModifiedAtDifferent(
  source: RemoteEntry,
  destination: RemoteEntry,
  toleranceMs: number,
): boolean {
  if (source.modifiedAt === undefined || destination.modifiedAt === undefined) return false;
  const delta = Math.abs(source.modifiedAt.getTime() - destination.modifiedAt.getTime());
  return delta > toleranceMs;
}
