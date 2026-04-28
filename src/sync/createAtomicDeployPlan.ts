/**
 * Atomic deploy planning helpers.
 *
 * Produces a structured plan that stages a release under `<liveRoot>/<releasesDir>/<releaseId>`,
 * activates it via rename or symlink swap, and prunes older releases beyond a retain count.
 *
 * The plan is provider-neutral and execution-free: callers wire the upload {@link TransferPlan}
 * through the transfer engine and execute the activate/prune steps using their provider's
 * filesystem mutation primitives (rename, symlink, delete).
 *
 * @module sync/createAtomicDeployPlan
 */
import type { ProviderId } from "../core/ProviderId";
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferPlan } from "../transfers/TransferPlan";
import { joinRemotePath, normalizeRemotePath } from "../utils/path";
import { createSyncPlan, type SyncEndpointInput } from "./createSyncPlan";
import type { RemoteTreeDiff } from "./diffRemoteTrees";

/** Activation strategy used to swap a staged release into place. */
export type AtomicDeployStrategy =
  /** Rename `<liveRoot>` aside, then rename the staging path to `<liveRoot>`. */
  | "rename"
  /** Update a symlink at `<liveRoot>` to point at the staging path. */
  | "symlink";

/** Operation kind for an activation step. */
export type AtomicDeployActivateOperation = "rename" | "symlink" | "delete";

/** Kind of activation step described by the plan. */
export interface AtomicDeployActivateStep {
  /** Stable identifier within the activation list. */
  id: string;
  /** Operation the step would perform. */
  operation: AtomicDeployActivateOperation;
  /** Source path the operation reads or moves from. */
  fromPath?: string;
  /** Destination path the operation writes to. */
  toPath: string;
  /** Provider identifier that owns the affected paths when known. */
  provider?: ProviderId;
  /** Whether the step replaces or removes data. */
  destructive?: boolean;
  /** Human-readable description for previews and logs. */
  reason: string;
}

/** Pruning step describing an old release directory marked for deletion. */
export interface AtomicDeployPruneStep {
  /** Stable identifier within the prune list. */
  id: string;
  /** Absolute release directory path to delete. */
  path: string;
  /** Provider identifier that owns the path when known. */
  provider?: ProviderId;
  /** Reason the release was selected for pruning. */
  reason: string;
}

/** Result returned by {@link createAtomicDeployPlan}. */
export interface AtomicDeployPlan {
  /** Stable plan identifier. */
  id: string;
  /** Release identifier embedded into the staging path. */
  releaseId: string;
  /** Activation strategy chosen for the swap. */
  strategy: AtomicDeployStrategy;
  /** Provider identifier for the live destination when known. */
  provider?: ProviderId;
  /** Live target path the release activates onto. */
  livePath: string;
  /** Staging directory the upload populates. */
  stagingPath: string;
  /** Releases root directory under which staging and prior releases live. */
  releasesRoot: string;
  /** Optional backup path used by the rename strategy. */
  backupPath?: string;
  /** Upload plan that populates the staging directory. */
  uploadPlan: TransferPlan;
  /** Activation steps that swap staging into the live path. */
  activate: AtomicDeployActivateStep[];
  /** Prune steps that remove older releases beyond {@link retain}. */
  prune: AtomicDeployPruneStep[];
  /** Number of releases to retain (including the new release). */
  retain: number;
  /** Time the plan was created. */
  createdAt: Date;
  /** Non-fatal plan warnings. */
  warnings: string[];
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Options accepted by {@link createAtomicDeployPlan}. */
export interface CreateAtomicDeployPlanOptions {
  /** Stable plan identifier. */
  id: string;
  /** Diff describing source vs. staging contents (typically diffed against an empty staging directory). */
  diff: RemoteTreeDiff;
  /** Source-side endpoint feeding the release. */
  source: SyncEndpointInput;
  /** Live destination endpoint the release activates onto. */
  destination: SyncEndpointInput;
  /** Activation strategy. Defaults to `"rename"`. */
  strategy?: AtomicDeployStrategy;
  /** Release identifier. Defaults to a timestamp derived from {@link now}. */
  releaseId?: string;
  /** Releases directory name under the destination root. Defaults to `".releases"`. */
  releasesDirectory?: string;
  /** Number of releases to retain after the new release, including the new one. Defaults to `3`. */
  retain?: number;
  /** Existing release directory paths under the releases root that may be pruned. */
  existingReleases?: string[];
  /** Whether the plan is informational only. Defaults to `true`. */
  dryRun?: boolean;
  /** Clock used for deterministic tests. Defaults to `new Date()`. */
  now?: () => Date;
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

const DEFAULT_RELEASES_DIRECTORY = ".releases";
const DEFAULT_RETAIN = 3;

/**
 * Builds an {@link AtomicDeployPlan} that stages a release, swaps it live, and prunes old releases.
 *
 * @param options - Inputs and policies that shape the deploy.
 * @returns Structured deploy plan ready for execution by the calling host.
 * @throws {@link ConfigurationError} When `retain` is less than `1` or the destination root is empty.
 */
export function createAtomicDeployPlan(
  options: CreateAtomicDeployPlanOptions,
): AtomicDeployPlan {
  const retain = options.retain ?? DEFAULT_RETAIN;
  if (retain < 1) {
    throw new ConfigurationError({
      details: { retain },
      message: "Atomic deploy retain count must be at least 1",
      retryable: false,
    });
  }

  const livePath = normalizeRemotePath(options.destination.rootPath);
  if (livePath === "/") {
    throw new ConfigurationError({
      message: "Atomic deploy destination rootPath must not be the filesystem root",
      retryable: false,
    });
  }

  const strategy: AtomicDeployStrategy = options.strategy ?? "rename";
  const now = options.now?.() ?? new Date();
  const releaseId = options.releaseId ?? defaultReleaseId(now);
  const releasesRoot = joinRemotePath(livePath, options.releasesDirectory ?? DEFAULT_RELEASES_DIRECTORY);
  const stagingPath = joinRemotePath(releasesRoot, releaseId);
  const backupPath = strategy === "rename" ? joinRemotePath(releasesRoot, `${releaseId}.previous`) : undefined;
  const provider = options.destination.provider ?? options.source.provider;
  const warnings: string[] = [];

  const uploadPlan = createSyncPlan({
    conflictPolicy: "overwrite",
    deletePolicy: "never",
    destination: {
      ...(options.destination.provider !== undefined ? { provider: options.destination.provider } : {}),
      rootPath: stagingPath,
    },
    diff: options.diff,
    direction: "source-to-destination",
    dryRun: options.dryRun ?? true,
    id: `${options.id}/upload`,
    includeDirectoryActions: false,
    ...(options.now !== undefined ? { now: options.now } : {}),
    source: options.source,
  });

  const activate = buildActivateSteps({
    backupPath,
    livePath,
    planId: options.id,
    provider,
    stagingPath,
    strategy,
  });

  const prune = buildPruneSteps({
    existingReleases: options.existingReleases ?? [],
    planId: options.id,
    provider,
    releaseId,
    releasesRoot,
    retain,
  });

  const plan: AtomicDeployPlan = {
    activate,
    createdAt: now,
    id: options.id,
    livePath,
    prune,
    releaseId,
    releasesRoot,
    retain,
    stagingPath,
    strategy,
    uploadPlan,
    warnings,
  };
  if (provider !== undefined) plan.provider = provider;
  if (backupPath !== undefined) plan.backupPath = backupPath;
  if (options.metadata !== undefined) plan.metadata = { ...options.metadata };
  return plan;
}

interface BuildActivateContext {
  backupPath: string | undefined;
  livePath: string;
  planId: string;
  provider: ProviderId | undefined;
  stagingPath: string;
  strategy: AtomicDeployStrategy;
}

function buildActivateSteps(context: BuildActivateContext): AtomicDeployActivateStep[] {
  if (context.strategy === "symlink") {
    const step: AtomicDeployActivateStep = {
      destructive: true,
      fromPath: context.stagingPath,
      id: `${context.planId}/activate/symlink`,
      operation: "symlink",
      reason: "Update live symlink to point at the new release",
      toPath: context.livePath,
    };
    if (context.provider !== undefined) step.provider = context.provider;
    return [step];
  }

  const steps: AtomicDeployActivateStep[] = [];
  if (context.backupPath !== undefined) {
    const backup: AtomicDeployActivateStep = {
      destructive: true,
      fromPath: context.livePath,
      id: `${context.planId}/activate/backup`,
      operation: "rename",
      reason: "Rename current live path aside as a release backup",
      toPath: context.backupPath,
    };
    if (context.provider !== undefined) backup.provider = context.provider;
    steps.push(backup);
  }

  const promote: AtomicDeployActivateStep = {
    destructive: true,
    fromPath: context.stagingPath,
    id: `${context.planId}/activate/promote`,
    operation: "rename",
    reason: "Promote the staged release to the live path",
    toPath: context.livePath,
  };
  if (context.provider !== undefined) promote.provider = context.provider;
  steps.push(promote);
  return steps;
}

interface BuildPruneContext {
  existingReleases: string[];
  planId: string;
  provider: ProviderId | undefined;
  releaseId: string;
  releasesRoot: string;
  retain: number;
}

function buildPruneSteps(context: BuildPruneContext): AtomicDeployPruneStep[] {
  if (context.existingReleases.length === 0) return [];

  const normalizedRoot = normalizeRemotePath(context.releasesRoot);
  const newReleasePath = joinRemotePath(normalizedRoot, context.releaseId);
  const candidates = [...new Set(context.existingReleases.map((path) => normalizeRemotePath(path)))]
    .filter((path) => path !== newReleasePath)
    .sort();

  const releasesToRetain = Math.max(0, context.retain - 1);
  if (candidates.length <= releasesToRetain) return [];

  const toPrune = candidates.slice(0, candidates.length - releasesToRetain);
  return toPrune.map((path, index) => {
    const step: AtomicDeployPruneStep = {
      id: `${context.planId}/prune/${index}`,
      path,
      reason: "Older release exceeds retain window",
    };
    if (context.provider !== undefined) step.provider = context.provider;
    return step;
  });
}

function defaultReleaseId(now: Date): string {
  // ISO timestamp with characters safe for filesystem path segments (no `:` or `.`).
  return now.toISOString().replace(/[:.]/g, "-");
}
