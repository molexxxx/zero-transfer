/**
 * Whole-job (batch) checkpointing: persist a transfer plan, execute it with
 * per-step completion tracking, and resume the remaining steps after a crash
 * or restart.
 *
 * Two layers compose into fully resumable batch jobs:
 *
 * - **Step level** (this module): completed plan steps are recorded in a
 *   {@link TransferBatchStateStore} as they finish, so a re-run skips work
 *   that already succeeded.
 * - **Byte level** ({@link TransferResumeOptions} on the executor): a step
 *   that was interrupted mid-file resumes from its byte/part checkpoint
 *   instead of restarting.
 *
 * {@link runResumableBatch} is idempotent: call it with the same plan and
 * stores after a crash and it picks up exactly where the previous run
 * stopped. Use {@link serializeTransferPlan} /
 * {@link deserializeTransferPlan} to persist the plan itself across
 * processes.
 *
 * @module transfers/resumableBatch
 */
import { createHash } from "node:crypto";
import {
  mkdir as fsMkdir,
  readFile as fsReadFile,
  rename as fsRename,
  unlink as fsUnlink,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { join as joinPath } from "node:path";
import type { TransferClient } from "../core/TransferClient";
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferProgressEvent } from "../types/public";
import type { TransferEngine, TransferExecutor, TransferRetryPolicy } from "./TransferEngine";
import type {
  TransferBandwidthLimit,
  TransferJob,
  TransferReceipt,
  TransferTimeoutPolicy,
} from "./TransferJob";
import { createTransferPlan, type TransferPlan, type TransferPlanStep } from "./TransferPlan";
import { TransferQueue, type TransferQueueItem, type TransferQueueSummary } from "./TransferQueue";

/**
 * Serializes a transfer plan to JSON for persistence.
 *
 * The output round-trips through {@link deserializeTransferPlan}, so a plan
 * written to disk before a batch starts can be reloaded to resume the batch
 * in a fresh process.
 *
 * @param plan - Plan to serialize.
 * @returns Stable JSON representation.
 */
export function serializeTransferPlan(plan: TransferPlan): string {
  return JSON.stringify({
    createdAt: plan.createdAt.toISOString(),
    dryRun: plan.dryRun,
    id: plan.id,
    ...(plan.metadata !== undefined ? { metadata: plan.metadata } : {}),
    steps: plan.steps,
    version: 1,
    warnings: plan.warnings,
  });
}

/**
 * Parses a plan produced by {@link serializeTransferPlan}.
 *
 * @param text - Serialized plan JSON.
 * @returns The reconstructed plan.
 * @throws {@link ConfigurationError} When the input is not a serialized plan.
 */
export function deserializeTransferPlan(text: string): TransferPlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      message: "Serialized transfer plan is not valid JSON",
      retryable: false,
    });
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new ConfigurationError({
      message: "Serialized transfer plan must be a JSON object",
      retryable: false,
    });
  }
  const candidate = parsed as {
    createdAt?: unknown;
    dryRun?: unknown;
    id?: unknown;
    metadata?: unknown;
    steps?: unknown;
    version?: unknown;
    warnings?: unknown;
  };
  if (
    candidate.version !== 1 ||
    typeof candidate.id !== "string" ||
    !Array.isArray(candidate.steps)
  ) {
    throw new ConfigurationError({
      details: { version: candidate.version },
      message: "Serialized transfer plan has an unsupported shape or version",
      retryable: false,
    });
  }
  const createdAt =
    typeof candidate.createdAt === "string" ? new Date(candidate.createdAt) : new Date(NaN);

  return createTransferPlan({
    id: candidate.id,
    now: () => (Number.isNaN(createdAt.getTime()) ? new Date() : createdAt),
    steps: candidate.steps as TransferPlanStep[],
    ...(typeof candidate.dryRun === "boolean" ? { dryRun: candidate.dryRun } : {}),
    ...(Array.isArray(candidate.warnings) ? { warnings: candidate.warnings as string[] } : {}),
    ...(typeof candidate.metadata === "object" && candidate.metadata !== null
      ? { metadata: candidate.metadata as Record<string, unknown> }
      : {}),
  });
}

/** Persisted batch progress: which plan steps have completed. */
export interface TransferBatchState {
  /** Record schema version. */
  version: 1;
  /** Plan this state belongs to. */
  planId: string;
  /** Step ids that completed successfully, in completion order. */
  completedStepIds: string[];
  /** Epoch ms when this state was last updated. */
  updatedAtMs: number;
}

/**
 * Persistence contract for batch progress. `clear` is invoked when every
 * executable step has completed; it must tolerate missing entries.
 */
export interface TransferBatchStateStore {
  /** Loads progress for a plan id, or `undefined` when absent. */
  load(planId: string): Promise<TransferBatchState | undefined> | TransferBatchState | undefined;
  /** Persists progress for a plan id. */
  save(state: TransferBatchState): Promise<void> | void;
  /** Removes progress for a plan id. */
  clear(planId: string): Promise<void> | void;
}

/** Creates an in-memory {@link TransferBatchStateStore} (tests and single-process retries). */
export function createMemoryTransferBatchStateStore(): TransferBatchStateStore {
  const map = new Map<string, TransferBatchState>();
  return {
    clear: (planId) => {
      map.delete(planId);
    },
    load: (planId) => map.get(planId),
    save: (state) => {
      map.set(state.planId, state);
    },
  };
}

/** Options accepted by {@link createFileSystemTransferBatchStateStore}. */
export interface FileSystemTransferBatchStateStoreOptions {
  /**
   * Directory under which batch-state JSON files are written. Created
   * recursively if it does not exist; one file per plan id (SHA-256 hashed
   * filename), written atomically with mode `0600`.
   */
  directory: string;
}

/**
 * File-system backed {@link TransferBatchStateStore} that survives process
 * restarts, enabling cross-process batch resume.
 */
export function createFileSystemTransferBatchStateStore(
  options: FileSystemTransferBatchStateStoreOptions,
): TransferBatchStateStore {
  const directory = options.directory;
  if (typeof directory !== "string" || directory.length === 0) {
    throw new ConfigurationError({
      message: "createFileSystemTransferBatchStateStore requires a non-empty directory option",
      retryable: false,
    });
  }

  const fileFor = (planId: string): string => {
    const hash = createHash("sha256").update(planId).digest("hex");
    return joinPath(directory, `${hash}.batch.json`);
  };

  return {
    async clear(planId) {
      try {
        await fsUnlink(fileFor(planId));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    },
    async load(planId) {
      let text: string;
      try {
        text = await fsReadFile(fileFor(planId), "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
      try {
        const parsed = JSON.parse(text) as Partial<TransferBatchState>;
        if (
          parsed.version !== 1 ||
          parsed.planId !== planId ||
          !Array.isArray(parsed.completedStepIds)
        ) {
          return undefined;
        }
        return parsed as TransferBatchState;
      } catch {
        return undefined;
      }
    },
    async save(state) {
      await fsMkdir(directory, { recursive: true });
      const target = fileFor(state.planId);
      const tmp = `${target}.${String(process.pid)}.${String(Date.now())}.tmp`;
      await fsWriteFile(tmp, JSON.stringify(state), { encoding: "utf8", mode: 0o600 });
      await fsRename(tmp, target);
    },
  };
}

/** Options accepted by {@link runResumableBatch}. */
export interface ResumableBatchOptions {
  /** Plan to execute (or re-execute after a crash). */
  plan: TransferPlan;
  /**
   * Executor for individual jobs. Pass an executor created with
   * {@link createProviderTransferExecutor} and a `resume` option so
   * interrupted files also resume at the byte level.
   */
  executor: TransferExecutor;
  /** Step-completion persistence. */
  batchStore: TransferBatchStateStore;
  /** Transfer engine override forwarded to the queue. */
  engine?: TransferEngine;
  /** Client whose defaults seed queue retry/timeout policies. */
  client?: TransferClient;
  /** Maximum steps executed concurrently. Defaults to `1`. */
  concurrency?: number;
  /** Retry policy forwarded to the queue. */
  retry?: TransferRetryPolicy;
  /** Timeout policy forwarded to the queue. */
  timeout?: TransferTimeoutPolicy;
  /** Bandwidth limit forwarded to the queue. */
  bandwidthLimit?: TransferBandwidthLimit;
  /** Abort signal canceling the batch run. */
  signal?: AbortSignal;
  /** Progress observer shared across the batch. */
  onProgress?: (event: TransferProgressEvent) => void;
  /** Completion observer per successful step. */
  onReceipt?: (receipt: TransferReceipt) => void;
  /** Failure observer per failed step. */
  onError?: (item: TransferQueueItem, error: unknown) => void;
}

/** Result returned by {@link runResumableBatch}. */
export interface ResumableBatchResult {
  /** Queue drain summary for the steps executed in this run. */
  summary: TransferQueueSummary;
  /** Step ids skipped this run because a prior run already completed them. */
  previouslyCompletedStepIds: string[];
  /** Every executable step id completed so far, across all runs. */
  completedStepIds: string[];
  /** Executable step ids still incomplete after this run. */
  remainingStepIds: string[];
  /** Whether every executable step in the plan has now completed. */
  complete: boolean;
}

/**
 * Executes a transfer plan as a resumable batch job.
 *
 * Completed steps are persisted to the batch store as they finish; re-running
 * with the same plan and store skips them, so a crashed or aborted batch
 * resumes from the first incomplete step. When the executor is configured
 * with byte-level resume, a step interrupted mid-file continues from its
 * checkpoint as well. The batch state is cleared automatically once every
 * executable step has completed.
 *
 * @example Crash-safe nightly sync batch
 * ```ts
 * import {
 *   createFileSystemTransferBatchStateStore,
 *   createFileSystemTransferCheckpointStore,
 *   createProviderTransferExecutor,
 *   deserializeTransferPlan,
 *   runResumableBatch,
 *   serializeTransferPlan,
 * } from "@zero-transfer/sdk";
 * import { readFile, writeFile } from "node:fs/promises";
 *
 * // First run: persist the plan, then execute it.
 * await writeFile("./batch.plan.json", serializeTransferPlan(plan), "utf8");
 *
 * // Every run (first or resumed) is the same call:
 * const result = await runResumableBatch({
 *   batchStore: createFileSystemTransferBatchStateStore({ directory: "./.zt-batches" }),
 *   concurrency: 4,
 *   executor: createProviderTransferExecutor({
 *     resolveSession,
 *     resume: {
 *       store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
 *     },
 *   }),
 *   plan: deserializeTransferPlan(await readFile("./batch.plan.json", "utf8")),
 *   retry: createDefaultRetryPolicy(),
 * });
 *
 * console.log(result.complete ? "batch done" : `${result.remainingStepIds.length} steps left`);
 * ```
 */
export async function runResumableBatch(
  options: ResumableBatchOptions,
): Promise<ResumableBatchResult> {
  const { plan, batchStore } = options;
  const executableSteps = plan.steps.filter((step) => step.action !== "skip");

  const prior = await batchStore.load(plan.id);
  const completed = new Set<string>(prior?.completedStepIds ?? []);
  const previouslyCompletedStepIds = executableSteps
    .filter((step) => completed.has(step.id))
    .map((step) => step.id);
  const pendingSteps = executableSteps.filter((step) => !completed.has(step.id));

  // Coalesced persistence: completions append in finish order, saves are
  // chained so concurrent step completions never interleave writes.
  let saveChain: Promise<void> = Promise.resolve();
  const recordCompletion = (stepId: string): void => {
    completed.add(stepId);
    const snapshot: TransferBatchState = {
      completedStepIds: executableSteps
        .filter((step) => completed.has(step.id))
        .map((step) => step.id),
      planId: plan.id,
      updatedAtMs: Date.now(),
      version: 1,
    };
    saveChain = saveChain.then(() => batchStore.save(snapshot)).catch(() => undefined);
  };

  const jobIdPrefix = `${plan.id}:`;
  const queue = new TransferQueue({
    executor: options.executor,
    onReceipt: (receipt) => {
      if (receipt.jobId.startsWith(jobIdPrefix)) {
        recordCompletion(receipt.jobId.slice(jobIdPrefix.length));
      }
      options.onReceipt?.(receipt);
    },
    ...(options.engine !== undefined ? { engine: options.engine } : {}),
    ...(options.client !== undefined ? { client: options.client } : {}),
    ...(options.concurrency !== undefined ? { concurrency: options.concurrency } : {}),
    ...(options.retry !== undefined ? { retry: options.retry } : {}),
    ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
    ...(options.bandwidthLimit !== undefined ? { bandwidthLimit: options.bandwidthLimit } : {}),
    ...(options.onProgress !== undefined ? { onProgress: options.onProgress } : {}),
    ...(options.onError !== undefined ? { onError: options.onError } : {}),
  });

  for (const step of pendingSteps) {
    queue.add(createStepJob(plan, step));
  }

  const summary = await queue.run({
    ...(options.signal !== undefined ? { signal: options.signal } : {}),
  });
  await saveChain;

  const remainingStepIds = executableSteps
    .filter((step) => !completed.has(step.id))
    .map((step) => step.id);
  const complete = remainingStepIds.length === 0;
  if (complete) {
    await batchStore.clear(plan.id);
  }

  return {
    complete,
    completedStepIds: executableSteps
      .filter((step) => completed.has(step.id))
      .map((step) => step.id),
    previouslyCompletedStepIds,
    remainingStepIds,
    summary,
  };
}

function createStepJob(plan: TransferPlan, step: TransferPlanStep): TransferJob {
  const job: TransferJob = {
    id: `${plan.id}:${step.id}`,
    operation: step.action,
  };
  if (step.source !== undefined) job.source = { ...step.source };
  if (step.destination !== undefined) job.destination = { ...step.destination };
  if (step.expectedBytes !== undefined) job.totalBytes = step.expectedBytes;
  if (step.metadata !== undefined) job.metadata = { ...step.metadata };
  return job;
}
