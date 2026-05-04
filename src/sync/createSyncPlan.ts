/**
 * Sync planning primitives that build a {@link TransferPlan} from a remote-tree diff.
 *
 * @module sync/createSyncPlan
 */
import type { ProviderId } from "../core/ProviderId";
import { ConfigurationError } from "../errors/ZeroTransferError";
import {
  createTransferPlan,
  type TransferPlan,
  type TransferPlanStep,
} from "../transfers/TransferPlan";
import { joinRemotePath, normalizeRemotePath } from "../utils/path";
import type { RemoteTreeDiff, RemoteTreeDiffEntry } from "./diffRemoteTrees";

/** Sync direction used by {@link createSyncPlan}. */
export type SyncDirection = "source-to-destination" | "destination-to-source";

/** How {@link createSyncPlan} reacts to entries that exist only on the destination. */
export type SyncDeletePolicy =
  /** Never delete destination entries that are missing on the source. */
  | "never"
  /** Plan destination deletions when running source-to-destination sync. */
  | "mirror"
  /** Plan destination deletions only when paired with a same-path file on the source. */
  | "replace-only";

/** How {@link createSyncPlan} reacts to entries flagged as modified on both sides. */
export type SyncConflictPolicy =
  /** Overwrite the destination with the source. */
  | "overwrite"
  /** Overwrite the source with the destination. */
  | "prefer-destination"
  /** Skip conflicting entries with a `skip` step. */
  | "skip"
  /** Fail planning with a {@link ConfigurationError} when a conflict is encountered. */
  | "error";

/** Endpoint shape supplied to {@link createSyncPlan}. */
export interface SyncEndpointInput {
  /** Provider that owns the endpoint when known. */
  provider?: ProviderId;
  /** Root path on the provider being synced. */
  rootPath: string;
}

/** Options accepted by {@link createSyncPlan}. */
export interface CreateSyncPlanOptions {
  /** Stable plan identifier. */
  id: string;
  /** Diff produced by {@link diffRemoteTrees} or an equivalent source. */
  diff: RemoteTreeDiff;
  /** Source-side endpoint that produced the diff. */
  source: SyncEndpointInput;
  /** Destination-side endpoint that produced the diff. */
  destination: SyncEndpointInput;
  /** Sync direction. Defaults to `"source-to-destination"`. */
  direction?: SyncDirection;
  /** Delete policy. Defaults to `"never"`. */
  deletePolicy?: SyncDeletePolicy;
  /** Conflict policy. Defaults to `"overwrite"`. */
  conflictPolicy?: SyncConflictPolicy;
  /** Whether to plan upload/download steps for directories. Defaults to `false`. */
  includeDirectoryActions?: boolean;
  /** Whether the plan is informational only. Defaults to `true`. */
  dryRun?: boolean;
  /** Clock used for deterministic tests. Defaults to `new Date()`. */
  now?: () => Date;
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/**
 * Builds a {@link TransferPlan} that reconciles two remote subtrees.
 *
 * Plan steps are derived from a {@link RemoteTreeDiff}; the function does not perform
 * any I/O. Direction, delete policy, and conflict policy control which entries
 * become executable transfers and which become `skip` steps.
 *
 * @param options - Inputs and policies that shape the plan.
 * @returns Transfer plan ready for `createTransferJobsFromPlan` or queue execution.
 * @throws {@link ConfigurationError} When `conflictPolicy: "error"` encounters a conflict.
 *
 * @example Mirror SFTP → S3 with deletes
 * ```ts
 * import {
 *   createSyncPlan,
 *   diffRemoteTrees,
 *   summarizeTransferPlan,
 * } from "@zero-transfer/sdk";
 *
 * const diff = await diffRemoteTrees(
 *   srcSession.fs, "/dist",
 *   dstSession.fs, "/releases/current",
 * );
 *
 * const plan = createSyncPlan({
 *   id: "release-mirror",
 *   diff,
 *   source: { provider: "sftp", rootPath: "/dist" },
 *   destination: { provider: "s3", rootPath: "/releases/current" },
 *   deletePolicy: "mirror",
 *   conflictPolicy: "overwrite",
 * });
 *
 * console.table(summarizeTransferPlan(plan));
 * ```
 */
export function createSyncPlan(options: CreateSyncPlanOptions): TransferPlan {
  const direction: SyncDirection = options.direction ?? "source-to-destination";
  const deletePolicy: SyncDeletePolicy = options.deletePolicy ?? "never";
  const conflictPolicy: SyncConflictPolicy = options.conflictPolicy ?? "overwrite";
  const includeDirectoryActions = options.includeDirectoryActions ?? false;
  const sourceRoot = normalizeRemotePath(options.source.rootPath);
  const destinationRoot = normalizeRemotePath(options.destination.rootPath);
  const warnings: string[] = [];
  const steps: TransferPlanStep[] = [];

  for (const entry of options.diff.entries) {
    const context: PlanEntryContext = {
      conflictPolicy,
      deletePolicy,
      destinationRoot,
      direction,
      entry,
      includeDirectoryActions,
      sourceRoot,
      warnings,
    };
    if (options.source.provider !== undefined) context.sourceProvider = options.source.provider;
    if (options.destination.provider !== undefined) {
      context.destinationProvider = options.destination.provider;
    }
    const step = planEntry(context);

    if (step !== undefined) steps.push(step);
  }

  const planInput: Parameters<typeof createTransferPlan>[0] = {
    id: options.id,
    steps,
    warnings,
  };
  if (options.dryRun !== undefined) planInput.dryRun = options.dryRun;
  if (options.now !== undefined) planInput.now = options.now;
  if (options.metadata !== undefined) planInput.metadata = options.metadata;

  return createTransferPlan(planInput);
}

interface PlanEntryContext {
  conflictPolicy: SyncConflictPolicy;
  deletePolicy: SyncDeletePolicy;
  destinationProvider?: ProviderId;
  destinationRoot: string;
  direction: SyncDirection;
  entry: RemoteTreeDiffEntry;
  includeDirectoryActions: boolean;
  sourceProvider?: ProviderId;
  sourceRoot: string;
  warnings: string[];
}

function planEntry(context: PlanEntryContext): TransferPlanStep | undefined {
  const { entry } = context;
  const isDirectory = isDirectoryEntry(entry);

  if (isDirectory && !context.includeDirectoryActions) {
    return undefined;
  }

  switch (entry.status) {
    case "added":
      return planAdded(context);
    case "removed":
      return planRemoved(context);
    case "modified":
      return planModified(context);
    case "unchanged":
      return planUnchanged(context);
    default:
      // Unreachable when callers pass a normalized RemoteTreeDiff.
      return undefined;
  }
}

function planAdded(context: PlanEntryContext): TransferPlanStep {
  if (context.direction === "source-to-destination") {
    return createCopyStep(context, "source", "destination", expectedBytesFor(context.entry));
  }

  // Direction is destination-to-source: source-only entries should be deleted.
  if (context.deletePolicy === "never") {
    return createSkipStep(context, "Source-only entry preserved by delete policy");
  }

  return createDeleteStep(context, "source");
}

function planRemoved(context: PlanEntryContext): TransferPlanStep {
  if (context.direction === "destination-to-source") {
    return createCopyStep(context, "destination", "source", expectedBytesFor(context.entry));
  }

  // Direction is source-to-destination: destination-only entries.
  if (context.deletePolicy === "never") {
    return createSkipStep(context, "Destination-only entry preserved by delete policy");
  }

  if (context.deletePolicy === "replace-only") {
    return createSkipStep(
      context,
      "Destination-only entry preserved (no source replacement available)",
    );
  }

  return createDeleteStep(context, "destination");
}

function planModified(context: PlanEntryContext): TransferPlanStep {
  switch (context.conflictPolicy) {
    case "overwrite":
      return createCopyStep(context, "source", "destination", expectedBytesFor(context.entry), {
        destructive: true,
      });
    case "prefer-destination":
      return createCopyStep(context, "destination", "source", expectedBytesFor(context.entry), {
        destructive: true,
      });
    case "skip":
      return createSkipStep(context, `Conflict skipped: ${context.entry.reasons.join(",")}`);
    case "error":
      throw new ConfigurationError({
        details: {
          path: context.entry.path,
          reasons: context.entry.reasons,
        },
        message: `Sync plan conflict at ${context.entry.path} with reasons: ${context.entry.reasons.join(", ")}`,
        retryable: false,
      });
    default:
      return createSkipStep(context, "Conflict skipped");
  }
}

function planUnchanged(context: PlanEntryContext): TransferPlanStep {
  return createSkipStep(context, "Entry already in sync");
}

function createCopyStep(
  context: PlanEntryContext,
  fromSide: "source" | "destination",
  toSide: "source" | "destination",
  expectedBytes: number | undefined,
  overrides: Partial<TransferPlanStep> = {},
): TransferPlanStep {
  const step: TransferPlanStep = {
    action: "copy",
    id: makeStepId(context.entry, `copy-${fromSide}-to-${toSide}`),
    reason: describeReasons(context.entry, `Copy ${fromSide} to ${toSide}`),
  };

  step.source = endpointFor(context, fromSide);
  step.destination = endpointFor(context, toSide);
  if (expectedBytes !== undefined) step.expectedBytes = expectedBytes;
  if (overrides.destructive === true) step.destructive = true;
  if (overrides.metadata !== undefined) step.metadata = { ...overrides.metadata };

  return step;
}

function createDeleteStep(
  context: PlanEntryContext,
  side: "source" | "destination",
): TransferPlanStep {
  return {
    action: "delete",
    destination: endpointFor(context, side),
    destructive: true,
    id: makeStepId(context.entry, `delete-${side}`),
    reason: `Delete ${side} entry not present on the other side`,
  };
}

function createSkipStep(context: PlanEntryContext, reason: string): TransferPlanStep {
  return {
    action: "skip",
    id: makeStepId(context.entry, "skip"),
    reason,
    source: endpointFor(context, "source"),
    destination: endpointFor(context, "destination"),
  };
}

function endpointFor(
  context: PlanEntryContext,
  side: "source" | "destination",
): NonNullable<TransferPlanStep["source"]> {
  const root = side === "source" ? context.sourceRoot : context.destinationRoot;
  const provider = side === "source" ? context.sourceProvider : context.destinationProvider;
  const endpoint: NonNullable<TransferPlanStep["source"]> = {
    path: joinRootAndRelative(root, context.entry.path),
  };
  if (provider !== undefined) endpoint.provider = provider;
  return endpoint;
}

function joinRootAndRelative(rootPath: string, relativePath: string): string {
  if (rootPath === "/") return relativePath;
  if (relativePath === "/") return rootPath;
  return joinRemotePath(rootPath, relativePath);
}

function makeStepId(entry: RemoteTreeDiffEntry, suffix: string): string {
  return `${entry.path}#${suffix}`;
}

function describeReasons(entry: RemoteTreeDiffEntry, prefix: string): string {
  if (entry.reasons.length === 0) return prefix;
  return `${prefix} (${entry.reasons.join(",")})`;
}

function expectedBytesFor(entry: RemoteTreeDiffEntry): number | undefined {
  return entry.source?.size ?? entry.destination?.size;
}

function isDirectoryEntry(entry: RemoteTreeDiffEntry): boolean {
  return entry.source?.type === "directory" || entry.destination?.type === "directory";
}
