/**
 * Retention policies that classify remote entries into keep/evict groups.
 *
 * Retention is intentionally pure: callers feed in {@link RemoteEntry} listings
 * and a policy, the helper returns the split. Cleanup actions stay caller-driven
 * so retention can compose with whatever provider-specific delete or archive
 * surface is available.
 *
 * @module mft/retention
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { RemoteEntry } from "../types/public";

/** Retention policy that evicts entries older than `maxAgeMs`. */
export interface AgeRetentionPolicy {
  /** Discriminator. */
  kind: "age";
  /** Maximum age before an entry is considered evictable. */
  maxAgeMs: number;
}

/** Retention policy that retains the newest `maxCount` entries. */
export interface CountRetentionPolicy {
  /** Discriminator. */
  kind: "count";
  /** Maximum number of entries to retain. */
  maxCount: number;
  /**
   * Field used to rank entries from newest to oldest.
   * Defaults to `"modifiedAt"`. `"name"` sorts lexicographically (descending).
   */
  sortBy?: "modifiedAt" | "name";
}

/** Combined retention policy union accepted by {@link evaluateRetention}. */
export type RetentionPolicy = AgeRetentionPolicy | CountRetentionPolicy;

/** Result returned by {@link evaluateRetention}. */
export interface RetentionEvaluation {
  /** Entries that should be retained. */
  keep: RemoteEntry[];
  /** Entries selected for eviction. */
  evict: RemoteEntry[];
}

/** Options accepted by {@link evaluateRetention}. */
export interface EvaluateRetentionOptions {
  /** Listing to evaluate. Directories and symlinks are passed through unchanged. */
  entries: readonly RemoteEntry[];
  /** Policy to apply. */
  policy: RetentionPolicy;
  /** Reference time used by age policies. Defaults to `new Date()`. */
  now?: Date;
}

/**
 * Splits a listing into retained and evictable entries according to a policy.
 *
 * @param options - Listing, policy, and optional reference clock.
 * @returns The keep/evict split.
 * @throws {@link ConfigurationError} When the policy is malformed.
 */
export function evaluateRetention(options: EvaluateRetentionOptions): RetentionEvaluation {
  validatePolicy(options.policy);

  if (options.policy.kind === "age") {
    return evaluateAgePolicy(options.entries, options.policy, options.now ?? new Date());
  }

  return evaluateCountPolicy(options.entries, options.policy);
}

function validatePolicy(policy: RetentionPolicy): void {
  if (policy.kind === "age") {
    if (!Number.isFinite(policy.maxAgeMs) || policy.maxAgeMs < 0) {
      throw new ConfigurationError({
        details: { kind: policy.kind },
        message: "Retention policy maxAgeMs must be a non-negative finite number",
        retryable: false,
      });
    }
    return;
  }

  if (!Number.isInteger(policy.maxCount) || policy.maxCount < 0) {
    throw new ConfigurationError({
      details: { kind: policy.kind },
      message: "Retention policy maxCount must be a non-negative integer",
      retryable: false,
    });
  }
}

function evaluateAgePolicy(
  entries: readonly RemoteEntry[],
  policy: AgeRetentionPolicy,
  now: Date,
): RetentionEvaluation {
  const cutoff = now.getTime() - policy.maxAgeMs;
  const keep: RemoteEntry[] = [];
  const evict: RemoteEntry[] = [];

  for (const entry of entries) {
    if (entry.type !== "file") {
      keep.push(entry);
      continue;
    }

    const modifiedAt = entry.modifiedAt?.getTime();
    if (modifiedAt === undefined || modifiedAt >= cutoff) {
      keep.push(entry);
    } else {
      evict.push(entry);
    }
  }

  return { evict, keep };
}

function evaluateCountPolicy(
  entries: readonly RemoteEntry[],
  policy: CountRetentionPolicy,
): RetentionEvaluation {
  const files: RemoteEntry[] = [];
  const passthrough: RemoteEntry[] = [];

  for (const entry of entries) {
    if (entry.type === "file") {
      files.push(entry);
    } else {
      passthrough.push(entry);
    }
  }

  const sortBy = policy.sortBy ?? "modifiedAt";
  const sorted = [...files].sort((a, b) => compareEntries(a, b, sortBy));
  const keptFiles = sorted.slice(0, policy.maxCount);
  const evicted = sorted.slice(policy.maxCount);

  return { evict: evicted, keep: [...passthrough, ...keptFiles] };
}

function compareEntries(a: RemoteEntry, b: RemoteEntry, sortBy: "modifiedAt" | "name"): number {
  if (sortBy === "name") {
    return a.name < b.name ? 1 : a.name > b.name ? -1 : 0;
  }

  const aTime = a.modifiedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
  const bTime = b.modifiedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
  return bTime - aTime;
}
