/**
 * Abort-aware transfer engine foundation.
 *
 * @module transfers/TransferEngine
 */
import { AbortError, TransferError, ZeroFTPError } from "../errors/ZeroFTPError";
import { createProgressEvent } from "../services/TransferService";
import type { TransferProgressEvent } from "../types/public";
import type {
  TransferAttempt,
  TransferAttemptError,
  TransferExecutionResult,
  TransferJob,
  TransferReceipt,
} from "./TransferJob";

/** Context passed to a concrete transfer operation. */
export interface TransferExecutionContext {
  /** Job being executed. */
  job: TransferJob;
  /** One-based attempt number. */
  attempt: number;
  /** Abort signal active for this execution when supplied. */
  signal?: AbortSignal;
  /** Throws an SDK abort error when the active signal has been cancelled. */
  throwIfAborted(): void;
  /** Emits a normalized progress event through engine options. */
  reportProgress(bytesTransferred: number, totalBytes?: number): TransferProgressEvent;
}

/** Concrete transfer operation implementation used by the engine. */
export type TransferExecutor = (
  context: TransferExecutionContext,
) => Promise<TransferExecutionResult> | TransferExecutionResult;

/** Input used by retry policy hooks. */
export interface TransferRetryDecisionInput {
  /** Error thrown by the failed attempt. */
  error: unknown;
  /** One-based attempt number that failed. */
  attempt: number;
  /** Job being executed. */
  job: TransferJob;
}

/** Retry policy for transfer execution. */
export interface TransferRetryPolicy {
  /** Maximum total attempts, including the first attempt. Defaults to `1`. */
  maxAttempts?: number;
  /** Decides whether a failed attempt should be retried. Defaults to SDK retryability metadata. */
  shouldRetry?(input: TransferRetryDecisionInput): boolean;
  /** Observes retry decisions before the next attempt starts. */
  onRetry?(input: TransferRetryDecisionInput): void;
}

/** Options used by {@link TransferEngine.execute}. */
export interface TransferEngineExecuteOptions {
  /** Abort signal used to cancel the job. */
  signal?: AbortSignal;
  /** Retry policy used for failed attempts. */
  retry?: TransferRetryPolicy;
  /** Progress observer for normalized transfer progress events. */
  onProgress?(event: TransferProgressEvent): void;
}

/** Construction options for deterministic tests and host integration. */
export interface TransferEngineOptions {
  /** Clock used for receipts and progress events. Defaults to `new Date()`. */
  now?: () => Date;
}

/** Executes transfer jobs and produces audit-friendly receipts. */
export class TransferEngine {
  private readonly now: () => Date;

  /**
   * Creates a transfer engine.
   *
   * @param options - Optional clock override for deterministic tests.
   */
  constructor(options: TransferEngineOptions = {}) {
    this.now = options.now ?? (() => new Date());
  }

  /**
   * Executes a transfer job through a caller-supplied operation.
   *
   * @param job - Job metadata used for correlation and receipts.
   * @param executor - Concrete transfer operation implementation.
   * @param options - Optional abort, retry, and progress hooks.
   * @returns Receipt for the completed transfer.
   * @throws {@link AbortError} When execution is cancelled.
   * @throws {@link TransferError} When all attempts fail.
   */
  async execute(
    job: TransferJob,
    executor: TransferExecutor,
    options: TransferEngineExecuteOptions = {},
  ): Promise<TransferReceipt> {
    const maxAttempts = normalizeMaxAttempts(options.retry?.maxAttempts);
    const attempts: TransferAttempt[] = [];
    const startedAt = this.now();
    let latestBytesTransferred = 0;

    for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
      this.throwIfAborted(options.signal, job);

      const attemptStartedAt = this.now();
      const context = this.createExecutionContext(
        job,
        attemptNumber,
        attemptStartedAt,
        options,
        (bytesTransferred) => {
          latestBytesTransferred = bytesTransferred;
        },
      );

      try {
        const result = await executor(context);
        context.throwIfAborted();
        latestBytesTransferred = result.bytesTransferred;

        const completedAt = this.now();
        attempts.push(
          createAttempt(attemptNumber, attemptStartedAt, completedAt, result.bytesTransferred),
        );

        return createReceipt(job, result, attempts, startedAt, completedAt);
      } catch (error) {
        const completedAt = this.now();
        const attempt = createAttempt(
          attemptNumber,
          attemptStartedAt,
          completedAt,
          latestBytesTransferred,
          summarizeError(error),
        );
        attempts.push(attempt);

        if (error instanceof AbortError) {
          throw error;
        }

        const retryInput: TransferRetryDecisionInput = { attempt: attemptNumber, error, job };
        const shouldRetry =
          attemptNumber < maxAttempts &&
          (options.retry?.shouldRetry?.(retryInput) ?? isRetryable(error));

        if (shouldRetry) {
          options.retry?.onRetry?.(retryInput);
          continue;
        }

        throw createTransferFailure(job, error, attempts);
      }
    }

    throw createTransferFailure(job, undefined, attempts);
  }

  private createExecutionContext(
    job: TransferJob,
    attempt: number,
    startedAt: Date,
    options: TransferEngineExecuteOptions,
    updateBytesTransferred: (bytesTransferred: number) => void,
  ): TransferExecutionContext {
    const context: TransferExecutionContext = {
      attempt,
      job,
      reportProgress: (bytesTransferred, totalBytes) => {
        this.throwIfAborted(options.signal, job);
        updateBytesTransferred(bytesTransferred);
        const progressInput = {
          bytesTransferred,
          now: this.now(),
          startedAt,
          transferId: job.id,
        };
        const resolvedTotalBytes = totalBytes ?? job.totalBytes;
        const event = createProgressEvent(
          resolvedTotalBytes === undefined
            ? progressInput
            : { ...progressInput, totalBytes: resolvedTotalBytes },
        );
        options.onProgress?.(event);
        return event;
      },
      throwIfAborted: () => this.throwIfAborted(options.signal, job),
    };

    if (options.signal !== undefined) {
      context.signal = options.signal;
    }

    return context;
  }

  private throwIfAborted(signal: AbortSignal | undefined, job: TransferJob): void {
    if (signal?.aborted === true) {
      throw new AbortError({
        details: { jobId: job.id, operation: job.operation },
        message: `Transfer job aborted: ${job.id}`,
        retryable: false,
      });
    }
  }
}

function normalizeMaxAttempts(value: number | undefined): number {
  if (value === undefined) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function createAttempt(
  attempt: number,
  startedAt: Date,
  completedAt: Date,
  bytesTransferred: number,
  error?: TransferAttemptError,
): TransferAttempt {
  const result: TransferAttempt = {
    attempt,
    bytesTransferred,
    completedAt,
    durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
    startedAt,
  };

  if (error !== undefined) {
    result.error = error;
  }

  return result;
}

function createReceipt(
  job: TransferJob,
  result: TransferExecutionResult,
  attempts: TransferAttempt[],
  startedAt: Date,
  completedAt: Date,
): TransferReceipt {
  const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
  const receipt: TransferReceipt = {
    attempts,
    averageBytesPerSecond: calculateBytesPerSecond(result.bytesTransferred, durationMs),
    bytesTransferred: result.bytesTransferred,
    completedAt,
    durationMs,
    jobId: job.id,
    operation: job.operation,
    resumed: result.resumed ?? job.resumed ?? false,
    startedAt,
    transferId: job.id,
    verified: result.verified ?? false,
    warnings: [...(result.warnings ?? [])],
  };

  if (job.source !== undefined) receipt.source = { ...job.source };
  if (job.destination !== undefined) receipt.destination = { ...job.destination };
  if (result.totalBytes !== undefined) receipt.totalBytes = result.totalBytes;
  else if (job.totalBytes !== undefined) receipt.totalBytes = job.totalBytes;
  if (result.checksum !== undefined) receipt.checksum = result.checksum;
  if (job.metadata !== undefined) receipt.metadata = { ...job.metadata };

  return receipt;
}

function createTransferFailure(
  job: TransferJob,
  error: unknown,
  attempts: TransferAttempt[],
): TransferError {
  return new TransferError({
    cause: error,
    details: {
      attempts,
      jobId: job.id,
      operation: job.operation,
    },
    message: `Transfer job failed: ${job.id}`,
    retryable: isRetryable(error),
  });
}

function summarizeError(error: unknown): TransferAttemptError {
  if (error instanceof ZeroFTPError) {
    return {
      code: error.code,
      message: error.message,
      name: error.name,
      retryable: error.retryable,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  return {
    message: String(error),
    name: "Error",
  };
}

function isRetryable(error: unknown): boolean {
  return error instanceof ZeroFTPError && error.retryable;
}

function calculateBytesPerSecond(bytes: number, durationMs: number): number {
  if (durationMs <= 0) {
    return bytes;
  }

  return bytes / (durationMs / 1000);
}
