/**
 * Transfer plan and dry-run primitives.
 *
 * @module transfers/TransferPlan
 */
import type { TransferEndpoint, TransferJob, TransferOperation } from "./TransferJob";

/** Non-executing plan action used to explain an intentionally skipped step. */
export type TransferPlanAction = TransferOperation | "skip";

/** Step inside a transfer plan. */
export interface TransferPlanStep {
  /** Stable step identifier within the plan. */
  id: string;
  /** Action the step would perform. */
  action: TransferPlanAction;
  /** Source endpoint when the action reads data. */
  source?: TransferEndpoint;
  /** Destination endpoint when the action writes data. */
  destination?: TransferEndpoint;
  /** Expected bytes affected by the step when known. */
  expectedBytes?: number;
  /** Whether this step may remove or replace data. */
  destructive?: boolean;
  /** Human-readable reason for planned or skipped work. */
  reason?: string;
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Input used to create a transfer plan. */
export interface TransferPlanInput {
  /** Stable plan identifier. */
  id: string;
  /** Planned steps in execution order. */
  steps: TransferPlanStep[];
  /** Whether the plan is informational only. Defaults to `true`. */
  dryRun?: boolean;
  /** Clock used for deterministic tests. Defaults to `new Date()`. */
  now?: () => Date;
  /** Non-fatal plan warnings. */
  warnings?: string[];
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Provider-neutral transfer plan. */
export interface TransferPlan {
  /** Stable plan identifier. */
  id: string;
  /** Whether this plan should be treated as a dry run. */
  dryRun: boolean;
  /** Time the plan was created. */
  createdAt: Date;
  /** Planned steps in execution order. */
  steps: TransferPlanStep[];
  /** Non-fatal plan warnings. */
  warnings: string[];
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Summary of a transfer plan. */
export interface TransferPlanSummary {
  /** Total number of steps. */
  totalSteps: number;
  /** Number of executable steps. */
  executableSteps: number;
  /** Number of skipped steps. */
  skippedSteps: number;
  /** Number of destructive steps. */
  destructiveSteps: number;
  /** Sum of expected bytes for steps that provide sizes. */
  totalExpectedBytes: number;
  /** Counts grouped by action. */
  actions: Record<string, number>;
}

/** Creates a transfer plan from dry-run planning input. */
export function createTransferPlan(input: TransferPlanInput): TransferPlan {
  const plan: TransferPlan = {
    createdAt: input.now?.() ?? new Date(),
    dryRun: input.dryRun ?? true,
    id: input.id,
    steps: input.steps.map(clonePlanStep),
    warnings: [...(input.warnings ?? [])],
  };

  if (input.metadata !== undefined) {
    plan.metadata = { ...input.metadata };
  }

  return plan;
}

/** Summarizes a transfer plan for diagnostics, previews, and tests. */
export function summarizeTransferPlan(plan: TransferPlan): TransferPlanSummary {
  const actions: Record<string, number> = {};
  let destructiveSteps = 0;
  let executableSteps = 0;
  let skippedSteps = 0;
  let totalExpectedBytes = 0;

  for (const step of plan.steps) {
    actions[step.action] = (actions[step.action] ?? 0) + 1;
    destructiveSteps += step.destructive === true ? 1 : 0;
    skippedSteps += step.action === "skip" ? 1 : 0;
    executableSteps += step.action === "skip" ? 0 : 1;
    totalExpectedBytes += step.expectedBytes ?? 0;
  }

  return {
    actions,
    destructiveSteps,
    executableSteps,
    skippedSteps,
    totalExpectedBytes,
    totalSteps: plan.steps.length,
  };
}

/** Converts executable plan steps into transfer jobs while preserving order. */
export function createTransferJobsFromPlan(plan: TransferPlan): TransferJob[] {
  return plan.steps.flatMap((step) => {
    if (step.action === "skip") {
      return [];
    }

    const job: TransferJob = {
      id: `${plan.id}:${step.id}`,
      operation: step.action,
    };

    if (step.source !== undefined) job.source = cloneEndpoint(step.source);
    if (step.destination !== undefined) job.destination = cloneEndpoint(step.destination);
    if (step.expectedBytes !== undefined) job.totalBytes = step.expectedBytes;
    if (step.metadata !== undefined) job.metadata = { ...step.metadata };

    return [job];
  });
}

function clonePlanStep(step: TransferPlanStep): TransferPlanStep {
  const clone: TransferPlanStep = {
    action: step.action,
    id: step.id,
  };

  if (step.source !== undefined) clone.source = cloneEndpoint(step.source);
  if (step.destination !== undefined) clone.destination = cloneEndpoint(step.destination);
  if (step.expectedBytes !== undefined) clone.expectedBytes = step.expectedBytes;
  if (step.destructive !== undefined) clone.destructive = step.destructive;
  if (step.reason !== undefined) clone.reason = step.reason;
  if (step.metadata !== undefined) clone.metadata = { ...step.metadata };

  return clone;
}

function cloneEndpoint(endpoint: TransferEndpoint): TransferEndpoint {
  const clone: TransferEndpoint = { path: endpoint.path };

  if (endpoint.provider !== undefined) {
    clone.provider = endpoint.provider;
  }

  return clone;
}
