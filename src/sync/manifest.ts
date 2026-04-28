/**
 * Remote manifest read/write/compare helpers.
 *
 * A manifest is a serializable snapshot of a remote subtree produced by walking
 * the live tree once and persisting the result. Manifests can be diffed against
 * each other to detect drift without re-listing both sides.
 *
 * @module sync/manifest
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { ProviderId } from "../core/ProviderId";
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { RemoteEntry, RemoteEntryType } from "../types/public";
import { normalizeRemotePath } from "../utils/path";
import type {
  RemoteTreeDiff,
  RemoteTreeDiffEntry,
  RemoteTreeDiffReason,
  RemoteTreeDiffStatus,
  RemoteTreeDiffSummary,
} from "./diffRemoteTrees";
import {
  walkRemoteTree,
  type RemoteTreeFilter,
  type WalkRemoteTreeOptions,
} from "./walkRemoteTree";

/** Schema version for the manifest payload. Bumped on incompatible format changes. */
export const REMOTE_MANIFEST_FORMAT_VERSION = 1;

/** Manifest entry recorded for each visited remote node. */
export interface RemoteManifestEntry {
  /** Path relative to {@link RemoteManifest.root}, beginning with `/`. */
  path: string;
  /** Entry kind. */
  type: RemoteEntryType;
  /** Entry size in bytes when known. */
  size?: number;
  /** Last modification time as an ISO 8601 timestamp when known. */
  modifiedAt?: string;
  /** Protocol-specific stable identity when available. */
  uniqueId?: string;
  /** Target path for symbolic links when known. */
  symlinkTarget?: string;
}

/** Persisted snapshot of a remote subtree. */
export interface RemoteManifest {
  /** Schema version. Must equal {@link REMOTE_MANIFEST_FORMAT_VERSION}. */
  formatVersion: number;
  /** ISO 8601 timestamp recording when the manifest was generated. */
  generatedAt: string;
  /** Normalized absolute root path the manifest snapshot is anchored to. */
  root: string;
  /** Optional provider identifier the snapshot was captured from. */
  provider?: ProviderId;
  /** Manifest entries sorted by path. */
  entries: RemoteManifestEntry[];
}

/** Options accepted by {@link createRemoteManifest}. */
export interface CreateRemoteManifestOptions {
  /** Optional traversal controls forwarded to {@link walkRemoteTree}. */
  walk?: Pick<
    WalkRemoteTreeOptions,
    "filter" | "followSymlinks" | "includeDirectories" | "includeFiles" | "maxDepth" | "recursive"
  >;
  /** Filter applied during traversal. Overrides `walk.filter` when provided. */
  filter?: RemoteTreeFilter;
  /** Provider identifier embedded into the manifest header. */
  provider?: ProviderId;
  /** Clock used to stamp `generatedAt`. Defaults to `Date.now`. */
  now?: () => Date;
  /** Optional abort signal threaded through the walk. */
  signal?: AbortSignal;
}

/** Options accepted by {@link compareRemoteManifests}. */
export interface CompareRemoteManifestsOptions {
  /** Whether unchanged entries are included in the result. Defaults to `false`. */
  includeUnchanged?: boolean;
  /** Tolerance in milliseconds applied to `modifiedAt` comparisons. Defaults to `1000`. */
  modifiedAtToleranceMs?: number;
  /** Whether modification timestamps participate in the comparison. Defaults to `true`. */
  compareModifiedAt?: boolean;
  /** Whether sizes participate in the comparison. Defaults to `true`. */
  compareSize?: boolean;
  /** Whether to require matching `uniqueId` checksums when both entries expose one. Defaults to `false`. */
  compareUniqueId?: boolean;
}

/**
 * Walks a remote subtree and produces a serializable manifest snapshot.
 *
 * @param fs - Remote file system to capture.
 * @param rootPath - Root path the manifest is anchored to.
 * @param options - Optional capture controls.
 * @returns Manifest snapshot suitable for serialization or comparison.
 */
export async function createRemoteManifest(
  fs: RemoteFileSystem,
  rootPath: string,
  options: CreateRemoteManifestOptions = {},
): Promise<RemoteManifest> {
  const root = normalizeRemotePath(rootPath);
  const walkOptions: WalkRemoteTreeOptions = { ...(options.walk ?? {}) };
  const resolvedFilter = options.filter ?? options.walk?.filter;
  if (resolvedFilter !== undefined) walkOptions.filter = resolvedFilter;
  if (options.signal !== undefined) walkOptions.signal = options.signal;

  const entries: RemoteManifestEntry[] = [];

  for await (const record of walkRemoteTree(fs, root, walkOptions)) {
    const relativePath = relativeFromRoot(record.entry.path, root);
    if (relativePath === undefined) continue;
    entries.push(toManifestEntry(record.entry, relativePath));
  }

  entries.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));

  const generatedAt = (options.now?.() ?? new Date()).toISOString();
  const manifest: RemoteManifest = {
    entries,
    formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
    generatedAt,
    root,
  };
  if (options.provider !== undefined) manifest.provider = options.provider;
  return manifest;
}

/**
 * Serializes a manifest to a JSON string suitable for persistence.
 *
 * @param manifest - Manifest snapshot to serialize.
 * @param indent - Optional indentation passed to `JSON.stringify`. Defaults to `2`.
 * @returns Stable JSON representation of the manifest.
 */
export function serializeRemoteManifest(manifest: RemoteManifest, indent: number = 2): string {
  return JSON.stringify(manifest, undefined, indent);
}

/**
 * Parses a JSON-encoded manifest, validating the schema version and entry shape.
 *
 * @param text - JSON payload produced by {@link serializeRemoteManifest}.
 * @returns Parsed manifest snapshot.
 * @throws {@link ConfigurationError} When the payload is invalid or has an unsupported version.
 */
export function parseRemoteManifest(text: string): RemoteManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      message: "Failed to parse remote manifest payload as JSON",
      retryable: false,
    });
  }

  if (parsed === null || typeof parsed !== "object") {
    throw new ConfigurationError({
      message: "Remote manifest payload must be a JSON object",
      retryable: false,
    });
  }

  const candidate = parsed as Partial<RemoteManifest> & Record<string, unknown>;
  if (candidate.formatVersion !== REMOTE_MANIFEST_FORMAT_VERSION) {
    throw new ConfigurationError({
      details: {
        expected: REMOTE_MANIFEST_FORMAT_VERSION,
        received: candidate.formatVersion,
      },
      message: `Unsupported remote manifest formatVersion: ${String(candidate.formatVersion)}`,
      retryable: false,
    });
  }

  if (typeof candidate.root !== "string" || candidate.root.length === 0) {
    throw new ConfigurationError({
      message: "Remote manifest root must be a non-empty string",
      retryable: false,
    });
  }

  if (typeof candidate.generatedAt !== "string") {
    throw new ConfigurationError({
      message: "Remote manifest generatedAt must be an ISO timestamp string",
      retryable: false,
    });
  }

  if (!Array.isArray(candidate.entries)) {
    throw new ConfigurationError({
      message: "Remote manifest entries must be an array",
      retryable: false,
    });
  }

  const entries = candidate.entries.map((entry, index) => normalizeManifestEntry(entry, index));
  const manifest: RemoteManifest = {
    entries,
    formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
    generatedAt: candidate.generatedAt,
    root: normalizeRemotePath(candidate.root),
  };
  if (typeof candidate.provider === "string") manifest.provider = candidate.provider;
  return manifest;
}

/**
 * Compares two manifests and produces an entry-level diff.
 *
 * The comparison is performed on the relative-path keys recorded inside each manifest;
 * the absolute roots may differ between snapshots (e.g. captured against `/site` on the
 * source and `/var/www/site` on the destination).
 *
 * @param source - Source-side manifest snapshot.
 * @param destination - Destination-side manifest snapshot.
 * @param options - Optional comparison controls.
 * @returns Diff result mirroring {@link RemoteTreeDiff}.
 */
export function compareRemoteManifests(
  source: RemoteManifest,
  destination: RemoteManifest,
  options: CompareRemoteManifestsOptions = {},
): RemoteTreeDiff {
  const includeUnchanged = options.includeUnchanged ?? false;
  const sourceMap = indexEntries(source);
  const destinationMap = indexEntries(destination);
  const paths = new Set<string>([...sourceMap.keys(), ...destinationMap.keys()]);

  const entries: RemoteTreeDiffEntry[] = [];
  const summary: RemoteTreeDiffSummary = {
    added: 0,
    modified: 0,
    removed: 0,
    total: 0,
    unchanged: 0,
  };

  for (const path of paths) {
    summary.total += 1;
    const sourceEntry = sourceMap.get(path);
    const destinationEntry = destinationMap.get(path);
    const reasons: RemoteTreeDiffReason[] = [];
    let status: RemoteTreeDiffStatus;

    if (sourceEntry !== undefined && destinationEntry === undefined) {
      status = "added";
      summary.added += 1;
    } else if (sourceEntry === undefined && destinationEntry !== undefined) {
      status = "removed";
      summary.removed += 1;
    } else if (sourceEntry !== undefined && destinationEntry !== undefined) {
      const computed = compareManifestEntries(sourceEntry, destinationEntry, options);
      if (computed.length === 0) {
        status = "unchanged";
        summary.unchanged += 1;
      } else {
        status = "modified";
        reasons.push(...computed);
        summary.modified += 1;
      }
    } else {
      continue;
    }

    if (status === "unchanged" && !includeUnchanged) continue;

    const record: RemoteTreeDiffEntry = { path, reasons, status };
    if (sourceEntry !== undefined) {
      record.source = manifestEntryToRemote(sourceEntry, source.root);
    }
    if (destinationEntry !== undefined) {
      record.destination = manifestEntryToRemote(destinationEntry, destination.root);
    }
    entries.push(record);
  }

  entries.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  return { entries, summary };
}

function relativeFromRoot(entryPath: string, root: string): string | undefined {
  const path = normalizeRemotePath(entryPath);
  if (path === root) return undefined;
  if (root === "/") return path;
  if (path.startsWith(`${root}/`)) return path.slice(root.length);
  return undefined;
}

function toManifestEntry(entry: RemoteEntry, relativePath: string): RemoteManifestEntry {
  const manifestEntry: RemoteManifestEntry = {
    path: relativePath,
    type: entry.type,
  };
  if (entry.size !== undefined) manifestEntry.size = entry.size;
  if (entry.modifiedAt !== undefined) manifestEntry.modifiedAt = entry.modifiedAt.toISOString();
  if (entry.uniqueId !== undefined) manifestEntry.uniqueId = entry.uniqueId;
  if (entry.symlinkTarget !== undefined) manifestEntry.symlinkTarget = entry.symlinkTarget;
  return manifestEntry;
}

function normalizeManifestEntry(value: unknown, index: number): RemoteManifestEntry {
  if (value === null || typeof value !== "object") {
    throw new ConfigurationError({
      details: { index },
      message: `Remote manifest entry at index ${index} must be an object`,
      retryable: false,
    });
  }

  const candidate = value as Partial<RemoteManifestEntry> & Record<string, unknown>;
  if (typeof candidate.path !== "string" || candidate.path.length === 0) {
    throw new ConfigurationError({
      details: { index },
      message: `Remote manifest entry at index ${index} must have a non-empty path`,
      retryable: false,
    });
  }
  if (!isRemoteEntryType(candidate.type)) {
    throw new ConfigurationError({
      details: { index, received: candidate.type },
      message: `Remote manifest entry at index ${index} has an invalid type`,
      retryable: false,
    });
  }

  const entry: RemoteManifestEntry = {
    path: candidate.path,
    type: candidate.type,
  };
  if (typeof candidate.size === "number") entry.size = candidate.size;
  if (typeof candidate.modifiedAt === "string") entry.modifiedAt = candidate.modifiedAt;
  if (typeof candidate.uniqueId === "string") entry.uniqueId = candidate.uniqueId;
  if (typeof candidate.symlinkTarget === "string") entry.symlinkTarget = candidate.symlinkTarget;
  return entry;
}

function isRemoteEntryType(value: unknown): value is RemoteEntryType {
  return value === "file" || value === "directory" || value === "symlink" || value === "unknown";
}

function indexEntries(manifest: RemoteManifest): Map<string, RemoteManifestEntry> {
  const map = new Map<string, RemoteManifestEntry>();
  for (const entry of manifest.entries) map.set(entry.path, entry);
  return map;
}

function manifestEntryToRemote(entry: RemoteManifestEntry, root: string): RemoteEntry {
  const absolutePath = root === "/" ? entry.path : `${root}${entry.path}`;
  const remote: RemoteEntry = {
    name: deriveName(entry.path),
    path: absolutePath,
    type: entry.type,
  };
  if (entry.size !== undefined) remote.size = entry.size;
  if (entry.modifiedAt !== undefined) {
    const parsed = new Date(entry.modifiedAt);
    if (!Number.isNaN(parsed.getTime())) remote.modifiedAt = parsed;
  }
  if (entry.uniqueId !== undefined) remote.uniqueId = entry.uniqueId;
  if (entry.symlinkTarget !== undefined) remote.symlinkTarget = entry.symlinkTarget;
  return remote;
}

function deriveName(path: string): string {
  const segments = path.split("/").filter(Boolean);
  return segments.length === 0 ? "/" : (segments[segments.length - 1] ?? "/");
}

function compareManifestEntries(
  source: RemoteManifestEntry,
  destination: RemoteManifestEntry,
  options: CompareRemoteManifestsOptions,
): RemoteTreeDiffReason[] {
  const reasons: RemoteTreeDiffReason[] = [];
  const compareSize = options.compareSize ?? true;
  const compareModifiedAt = options.compareModifiedAt ?? true;
  const compareUniqueId = options.compareUniqueId ?? false;
  const tolerance = options.modifiedAtToleranceMs ?? 1000;

  if (source.type !== destination.type) reasons.push("type");

  if (
    compareSize &&
    source.type === "file" &&
    destination.type === "file" &&
    source.size !== undefined &&
    destination.size !== undefined &&
    source.size !== destination.size
  ) {
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

function isModifiedAtDifferent(
  source: RemoteManifestEntry,
  destination: RemoteManifestEntry,
  toleranceMs: number,
): boolean {
  if (source.modifiedAt === undefined || destination.modifiedAt === undefined) return false;
  const sourceTime = Date.parse(source.modifiedAt);
  const destinationTime = Date.parse(destination.modifiedAt);
  if (Number.isNaN(sourceTime) || Number.isNaN(destinationTime)) return false;
  return Math.abs(sourceTime - destinationTime) > toleranceMs;
}
