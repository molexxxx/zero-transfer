/**
 * Transfer queue primitives built on top of {@link TransferEngine}.
 *
 * @module transfers/TransferQueue
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferProgressEvent } from "../types/public";
import {
  TransferEngine,
  type TransferEngineExecuteOptions,
  type TransferExecutor,
  type TransferRetryPolicy,
} from "./TransferEngine";
import type {
  TransferBandwidthLimit,
  TransferJob,
  TransferReceipt,
  TransferTimeoutPolicy,
} from "./TransferJob";

/** Queue item lifecycle state. */
export type TransferQueueItemStatus = "queued" | "running" | "completed" | "failed" | "canceled";

/** Resolver used when jobs do not provide an executor at enqueue time. */
export type TransferQueueExecutorResolver = (job: TransferJob) => TransferExecutor;

/** Options used to create a transfer queue. */
export interface TransferQueueOptions {
  /** Transfer engine used to execute queued jobs. Defaults to a new engine. */
  engine?: TransferEngine;
  /** Maximum jobs to execute at the same time. Defaults to `1`. */
  concurrency?: number;
  /** Default executor used for jobs that do not provide one directly. */
  executor?: TransferExecutor;
  /** Dynamic executor resolver used when no per-job executor or default executor exists. */
  resolveExecutor?: TransferQueueExecutorResolver;
  /** Retry policy passed to engine executions. */
  retry?: TransferRetryPolicy;
  /** Timeout policy passed to engine executions. */
  timeout?: TransferTimeoutPolicy;
  /** Optional throughput limit shape passed to transfer executors. */
  bandwidthLimit?: TransferBandwidthLimit;
  /** Progress observer shared across queued jobs. */
  onProgress?: (event: TransferProgressEvent) => void;
  /** Completion observer for successful jobs. */
  onReceipt?: (receipt: TransferReceipt) => void;
  /** Failure observer for failed jobs. */
  onError?: (item: TransferQueueItem, error: unknown) => void;
}

/** Options used when draining a queue. */
export interface TransferQueueRunOptions {
  /** Abort signal used to cancel running jobs during this drain. */
  signal?: AbortSignal;
  /** Retry policy override for this drain. */
  retry?: TransferRetryPolicy;
  /** Timeout policy override for this drain. */
  timeout?: TransferTimeoutPolicy;
  /** Bandwidth limit override for this drain. */
  bandwidthLimit?: TransferBandwidthLimit;
  /** Progress observer override for this drain. */
  onProgress?: (event: TransferProgressEvent) => void;
}

/** Enqueued transfer job state. */
export interface TransferQueueItem {
  /** Queued job identifier. */
  id: string;
  /** Original transfer job. */
  job: TransferJob;
  /** Current queue status. */
  status: TransferQueueItemStatus;
  /** Successful transfer receipt when completed. */
  receipt?: TransferReceipt;
  /** Failure or cancellation reason when available. */
  error?: unknown;
}

interface InternalTransferQueueItem extends TransferQueueItem {
  controller: AbortController;
  executor?: TransferExecutor;
}

/** Summary returned after a queue drain. */
export interface TransferQueueSummary {
  /** Number of items currently known to the queue. */
  total: number;
  /** Number of successfully completed jobs. */
  completed: number;
  /** Number of failed jobs. */
  failed: number;
  /** Number of canceled jobs. */
  canceled: number;
  /** Number of jobs still queued because the queue was paused. */
  queued: number;
  /** Number of jobs currently running. */
  running: number;
  /** Successful receipts in queue order. */
  receipts: TransferReceipt[];
  /** Failed queue items in queue order. */
  failures: TransferQueueItem[];
}

/** Minimal transfer queue with concurrency, pause/resume, cancellation, and drain summaries. */
export class TransferQueue {
  private readonly engine: TransferEngine;
  private readonly items: InternalTransferQueueItem[] = [];
  private readonly defaultExecutor: TransferExecutor | undefined;
  private readonly resolveExecutor: TransferQueueExecutorResolver | undefined;
  private readonly retry: TransferRetryPolicy | undefined;
  private readonly timeout: TransferTimeoutPolicy | undefined;
  private readonly bandwidthLimit: TransferBandwidthLimit | undefined;
  private readonly onProgress: ((event: TransferProgressEvent) => void) | undefined;
  private readonly onReceipt: ((receipt: TransferReceipt) => void) | undefined;
  private readonly onError: ((item: TransferQueueItem, error: unknown) => void) | undefined;
  private concurrency: number;
  private paused = false;

  /**
   * Creates a transfer queue.
   *
   * @param options - Queue engine, concurrency, executor, and observer options.
   */
  constructor(options: TransferQueueOptions = {}) {
    this.engine = options.engine ?? new TransferEngine();
    this.concurrency = normalizeConcurrency(options.concurrency);
    this.defaultExecutor = options.executor;
    this.resolveExecutor = options.resolveExecutor;
    this.retry = options.retry;
    this.timeout = options.timeout;
    this.bandwidthLimit = options.bandwidthLimit;
    this.onProgress = options.onProgress;
    this.onReceipt = options.onReceipt;
    this.onError = options.onError;
  }

  /** Adds a transfer job to the queue. */
  add(job: TransferJob, executor?: TransferExecutor): TransferQueueItem {
    if (this.items.some((item) => item.id === job.id)) {
      throw new ConfigurationError({
        details: { jobId: job.id },
        message: `Transfer queue already contains job: ${job.id}`,
        retryable: false,
      });
    }

    const item: InternalTransferQueueItem = {
      controller: new AbortController(),
      id: job.id,
      job: cloneTransferJob(job),
      status: "queued",
    };

    if (executor !== undefined) {
      item.executor = executor;
    }

    this.items.push(item);
    return toPublicItem(item);
  }

  /** Pauses dispatch of new queued jobs. Running jobs are allowed to finish. */
  pause(): void {
    this.paused = true;
  }

  /** Resumes dispatch of queued jobs on the next `run()` call. */
  resume(): void {
    this.paused = false;
  }

  /** Updates queue concurrency for subsequent drains. */
  setConcurrency(concurrency: number): void {
    this.concurrency = normalizeConcurrency(concurrency);
  }

  /** Cancels a queued or running job. */
  cancel(jobId: string): boolean {
    const item = this.items.find((candidate) => candidate.id === jobId);

    if (
      item === undefined ||
      item.status === "completed" ||
      item.status === "failed" ||
      item.status === "canceled"
    ) {
      return false;
    }

    item.controller.abort();

    if (item.status === "queued") {
      item.status = "canceled";
    }

    return true;
  }

  /** Returns a queued item snapshot by id. */
  get(jobId: string): TransferQueueItem | undefined {
    const item = this.items.find((candidate) => candidate.id === jobId);
    return item === undefined ? undefined : toPublicItem(item);
  }

  /** Lists queue item snapshots in insertion order. */
  list(): TransferQueueItem[] {
    return this.items.map(toPublicItem);
  }

  /** Drains currently queued jobs until complete, failed, canceled, or paused. */
  async run(options: TransferQueueRunOptions = {}): Promise<TransferQueueSummary> {
    const workerCount = Math.max(1, Math.min(this.concurrency, this.countDispatchableItems()));
    const workers = Array.from({ length: workerCount }, () => this.runWorker(options));

    await Promise.all(workers);
    return this.summarize();
  }

  /** Returns a queue summary without executing more work. */
  summarize(): TransferQueueSummary {
    const publicItems = this.items.map(toPublicItem);

    return {
      canceled: publicItems.filter((item) => item.status === "canceled").length,
      completed: publicItems.filter((item) => item.status === "completed").length,
      failed: publicItems.filter((item) => item.status === "failed").length,
      failures: publicItems.filter((item) => item.status === "failed"),
      queued: publicItems.filter((item) => item.status === "queued").length,
      receipts: publicItems
        .filter(
          (item): item is TransferQueueItem & { receipt: TransferReceipt } =>
            item.receipt !== undefined,
        )
        .map((item) => item.receipt),
      running: publicItems.filter((item) => item.status === "running").length,
      total: publicItems.length,
    };
  }

  private async runWorker(options: TransferQueueRunOptions): Promise<void> {
    for (;;) {
      const item = this.nextQueuedItem();

      if (item === undefined) {
        return;
      }

      await this.runItem(item, options);
    }
  }

  private nextQueuedItem(): InternalTransferQueueItem | undefined {
    if (this.paused) {
      return undefined;
    }

    const item = this.items.find((candidate) => candidate.status === "queued");

    if (item !== undefined) {
      item.status = item.controller.signal.aborted ? "canceled" : "running";
    }

    return item?.status === "running" ? item : undefined;
  }

  private async runItem(
    item: InternalTransferQueueItem,
    options: TransferQueueRunOptions,
  ): Promise<void> {
    const abortListener = createAbortForwarder(options.signal, item.controller);

    try {
      const executeOptions: TransferEngineExecuteOptions = {
        signal: item.controller.signal,
      };
      const onProgress = options.onProgress ?? this.onProgress;
      const retry = options.retry ?? this.retry;
      const timeout = options.timeout ?? this.timeout;
      const bandwidthLimit = options.bandwidthLimit ?? this.bandwidthLimit;

      if (onProgress !== undefined) {
        executeOptions.onProgress = onProgress;
      }

      if (retry !== undefined) {
        executeOptions.retry = retry;
      }

      if (timeout !== undefined) {
        executeOptions.timeout = timeout;
      }

      if (bandwidthLimit !== undefined) {
        executeOptions.bandwidthLimit = bandwidthLimit;
      }

      const receipt = await this.engine.execute(
        item.job,
        this.requireExecutor(item),
        executeOptions,
      );

      item.receipt = receipt;
      item.status = "completed";
      this.onReceipt?.(receipt);
    } catch (error) {
      item.error = error;
      item.status = item.controller.signal.aborted ? "canceled" : "failed";

      if (item.status === "failed") {
        this.onError?.(toPublicItem(item), error);
      }
    } finally {
      abortListener.dispose();
    }
  }

  private requireExecutor(item: InternalTransferQueueItem): TransferExecutor {
    const executor = item.executor ?? this.defaultExecutor ?? this.resolveExecutor?.(item.job);

    if (executor === undefined) {
      throw new ConfigurationError({
        details: { jobId: item.job.id },
        message: `Transfer queue job has no executor: ${item.job.id}`,
        retryable: false,
      });
    }

    return executor;
  }

  private countDispatchableItems(): number {
    return this.items.filter((item) => item.status === "queued" && !item.controller.signal.aborted)
      .length;
  }
}

function normalizeConcurrency(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function createAbortForwarder(
  source: AbortSignal | undefined,
  target: AbortController,
): { dispose(): void } {
  if (source === undefined) {
    return { dispose: () => undefined };
  }

  const abort = (): void => target.abort();

  if (source.aborted) {
    abort();
    return { dispose: () => undefined };
  }

  source.addEventListener("abort", abort, { once: true });

  return {
    dispose: () => source.removeEventListener("abort", abort),
  };
}

function toPublicItem(item: InternalTransferQueueItem): TransferQueueItem {
  const snapshot: TransferQueueItem = {
    id: item.id,
    job: cloneTransferJob(item.job),
    status: item.status,
  };

  if (item.receipt !== undefined) snapshot.receipt = item.receipt;
  if (item.error !== undefined) snapshot.error = item.error;

  return snapshot;
}

function cloneTransferJob(job: TransferJob): TransferJob {
  const clone: TransferJob = {
    id: job.id,
    operation: job.operation,
  };

  if (job.source !== undefined) clone.source = { ...job.source };
  if (job.destination !== undefined) clone.destination = { ...job.destination };
  if (job.totalBytes !== undefined) clone.totalBytes = job.totalBytes;
  if (job.resumed !== undefined) clone.resumed = job.resumed;
  if (job.metadata !== undefined) clone.metadata = { ...job.metadata };

  return clone;
}
