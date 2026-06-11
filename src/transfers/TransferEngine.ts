/**
 * Abort-aware transfer engine foundation.
 *
 * @module transfers/TransferEngine
 */
import {
  AbortError,
  TimeoutError,
  TransferError,
  ZeroTransferError,
} from "../errors/ZeroTransferError";
import { createProgressEvent } from "../services/TransferService";
import type { TransferProgressEvent } from "../types/public";
import type {
  TransferAttempt,
  TransferAttemptError,
  TransferBandwidthLimit,
  TransferExecutionResult,
  TransferJob,
  TransferReceipt,
  TransferTimeoutPolicy,
  TransferVerificationResult,
} from "./TransferJob";

/** Context passed to a concrete transfer operation. */
export interface TransferExecutionContext {
  /** Job being executed. */
  job: TransferJob;
  /** One-based attempt number. */
  attempt: number;
  /** Abort signal active for this execution when supplied. */
  signal?: AbortSignal;
  /** Optional throughput limit shape for concrete executors to honor. */
  bandwidthLimit?: TransferBandwidthLimit;
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
  /** Milliseconds elapsed since the engine execution started, including prior attempts and delays. */
  elapsedMs: number;
  /** Job being executed. */
  job: TransferJob;
}

/**
 * Retry policy for transfer execution.
 *
 * Use {@link createDefaultRetryPolicy} for a production-ready policy with
 * exponential backoff, full jitter, and `Retry-After` support, or implement
 * the hooks directly for full control.
 */
export interface TransferRetryPolicy {
  /** Maximum total attempts, including the first attempt. Defaults to `1`. */
  maxAttempts?: number;
  /** Decides whether a failed attempt should be retried. Defaults to SDK retryability metadata. */
  shouldRetry?(input: TransferRetryDecisionInput): boolean;
  /**
   * Computes the delay before the next attempt in milliseconds.
   *
   * The engine sleeps for the returned duration with an abort-aware timer:
   * cancelling the job during the delay rejects immediately instead of
   * waiting out the backoff. Non-positive or missing values retry at once.
   */
  getDelayMs?(input: TransferRetryDecisionInput): number;
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
  /** Timeout policy enforced by the engine. */
  timeout?: TransferTimeoutPolicy;
  /** Optional throughput limit shape passed through to concrete executors. */
  bandwidthLimit?: TransferBandwidthLimit;
}

/** Construction options for deterministic tests and host integration. */
export interface TransferEngineOptions {
  /** Clock used for receipts and progress events. Defaults to `new Date()`. */
  now?: () => Date;
}

/**
 * Executes transfer jobs and produces audit-friendly receipts.
 *
 * The engine is the lowest-level entry point in the transfer stack: it owns
 * retry policy, attempt history, abort propagation, progress event
 * normalization, and receipt construction. Most callers reach the engine
 * indirectly through {@link runRoute}, {@link uploadFile}, {@link downloadFile},
 * {@link copyBetween}, or {@link TransferQueue}; instantiate it directly when
 * you need full control over execution semantics.
 *
 * @example Execute a single job with a custom executor
 * ```ts
 * import {
 *   TransferEngine,
 *   createDefaultRetryPolicy,
 *   type TransferExecutor,
 *   type TransferJob,
 * } from "@zero-transfer/sdk";
 *
 * const engine = new TransferEngine();
 *
 * const executor: TransferExecutor = async ({ job, signal, onProgress }) => {
 *   onProgress?.({ jobId: job.id, bytesTransferred: 0 });
 *   // … perform the bytes here, honoring `signal` …
 *   return { jobId: job.id, bytesTransferred: 1234, completedAt: new Date() };
 * };
 *
 * const job: TransferJob = {
 *   id: "manual-1",
 *   operation: "upload",
 *   source: { profile: localProfile, path: "./data.bin" },
 *   destination: { profile: s3Profile, path: "/data/data.bin" },
 * };
 *
 * const receipt = await engine.execute(job, executor, {
 *   retry: createDefaultRetryPolicy(),
 *   timeout: { stallTimeoutMs: 30_000 },
 * });
 * console.log(receipt.attempts.length); // 1 on success
 * ```
 */
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
    const abortScope = createAbortScope(options.signal, options.timeout, job);
    let latestBytesTransferred = 0;

    try {
      for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
        this.throwIfAborted(abortScope.signal, job);

        const attemptStartedAt = this.now();
        const attemptScope = createAttemptScope(
          abortScope.signal,
          options.timeout,
          job,
          attemptNumber,
        );
        const context = this.createExecutionContext(
          job,
          attemptNumber,
          attemptStartedAt,
          options,
          attemptScope.signal,
          (bytesTransferred) => {
            latestBytesTransferred = bytesTransferred;
          },
          attemptScope.notifyProgress,
        );

        try {
          const result = await runExecutor(executor, context, attemptScope.signal, job);
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

          // Job-scope failures (caller abort or whole-job timeout) end execution
          // unconditionally. Attempt-scope timeouts and stalls fall through to the
          // retry decision like any other attempt failure.
          if (error instanceof AbortError || abortScope.signal?.aborted === true) {
            throw error;
          }

          const retryInput: TransferRetryDecisionInput = {
            attempt: attemptNumber,
            elapsedMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
            error,
            job,
          };
          const shouldRetry =
            attemptNumber < maxAttempts &&
            (options.retry?.shouldRetry?.(retryInput) ?? isRetryable(error));

          if (shouldRetry) {
            options.retry?.onRetry?.(retryInput);
            const delayMs = normalizeDelayMs(options.retry?.getDelayMs?.(retryInput));
            if (delayMs > 0) {
              await sleepWithAbort(delayMs, abortScope.signal, job);
            }
            continue;
          }

          throw createTransferFailure(job, error, attempts);
        } finally {
          attemptScope.dispose();
        }
      }

      throw createTransferFailure(job, undefined, attempts);
    } finally {
      abortScope.dispose();
    }
  }

  private createExecutionContext(
    job: TransferJob,
    attempt: number,
    startedAt: Date,
    options: TransferEngineExecuteOptions,
    signal: AbortSignal | undefined,
    updateBytesTransferred: (bytesTransferred: number) => void,
    notifyProgress: () => void,
  ): TransferExecutionContext {
    const context: TransferExecutionContext = {
      attempt,
      job,
      reportProgress: (bytesTransferred, totalBytes) => {
        this.throwIfAborted(signal, job);
        notifyProgress();
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
      throwIfAborted: () => this.throwIfAborted(signal, job),
    };

    if (signal !== undefined) {
      context.signal = signal;
    }

    if (options.bandwidthLimit !== undefined) {
      context.bandwidthLimit = { ...options.bandwidthLimit };
    }

    return context;
  }

  private throwIfAborted(signal: AbortSignal | undefined, job: TransferJob): void {
    if (signal?.aborted === true) {
      if (signal.reason instanceof ZeroTransferError) {
        throw signal.reason;
      }

      throw new AbortError({
        details: { jobId: job.id, operation: job.operation },
        message: `Transfer job aborted: ${job.id}`,
        retryable: false,
      });
    }
  }
}

interface AbortScope {
  signal?: AbortSignal;
  dispose(): void;
}

function createAbortScope(
  parentSignal: AbortSignal | undefined,
  timeout: TransferTimeoutPolicy | undefined,
  job: TransferJob,
): AbortScope {
  const timeoutMs = normalizeTimeoutMs(timeout?.timeoutMs);

  if (parentSignal === undefined && timeoutMs === undefined) {
    return { dispose: () => undefined };
  }

  const controller = new AbortController();
  const abortFromParent = (): void => controller.abort(parentSignal?.reason);
  const timeoutHandle =
    timeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          controller.abort(
            new TimeoutError({
              details: { jobId: job.id, operation: job.operation, timeoutMs },
              message: `Transfer job timed out after ${timeoutMs}ms: ${job.id}`,
              retryable: timeout?.retryable ?? true,
            }),
          );
        }, timeoutMs);

  if (parentSignal?.aborted === true) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  return {
    dispose: () => {
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
    signal: controller.signal,
  };
}

interface AttemptScope {
  signal?: AbortSignal;
  /** Resets the stall watchdog. Wired into the engine's progress interception. */
  notifyProgress: () => void;
  dispose: () => void;
}

/**
 * Builds the per-attempt abort scope nested under the job-scope signal.
 *
 * The attempt controller aborts on parent abort (propagating the parent
 * reason), on attempt timeout, and on stall (no progress reports within
 * `stallTimeoutMs`). Attempt-scope timeout errors are retryable by default so
 * they flow into the retry policy; job-scope failures are handled upstream.
 */
function createAttemptScope(
  parentSignal: AbortSignal | undefined,
  timeout: TransferTimeoutPolicy | undefined,
  job: TransferJob,
  attempt: number,
): AttemptScope {
  const attemptTimeoutMs = normalizeTimeoutMs(timeout?.attemptTimeoutMs);
  const stallTimeoutMs = normalizeTimeoutMs(timeout?.stallTimeoutMs);

  if (attemptTimeoutMs === undefined && stallTimeoutMs === undefined) {
    const scope: AttemptScope = {
      dispose: () => undefined,
      notifyProgress: () => undefined,
    };
    if (parentSignal !== undefined) scope.signal = parentSignal;
    return scope;
  }

  const controller = new AbortController();
  const retryable = timeout?.retryable ?? true;
  const abortFromParent = (): void => controller.abort(parentSignal?.reason);

  if (parentSignal?.aborted === true) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  const attemptTimer =
    attemptTimeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          controller.abort(
            new TimeoutError({
              details: { attempt, attemptTimeoutMs, jobId: job.id, operation: job.operation },
              message: `Transfer attempt ${String(attempt)} timed out after ${String(attemptTimeoutMs)}ms: ${job.id}`,
              retryable,
            }),
          );
        }, attemptTimeoutMs);

  let stallTimer: ReturnType<typeof setTimeout> | undefined;
  const armStallWatchdog = (): void => {
    if (stallTimeoutMs === undefined || controller.signal.aborted) return;
    if (stallTimer !== undefined) clearTimeout(stallTimer);
    stallTimer = setTimeout(() => {
      controller.abort(
        new TimeoutError({
          details: { attempt, jobId: job.id, operation: job.operation, stallTimeoutMs },
          message:
            `Transfer attempt ${String(attempt)} stalled ` +
            `(no progress for ${String(stallTimeoutMs)}ms): ${job.id}`,
          retryable,
        }),
      );
    }, stallTimeoutMs);
  };
  armStallWatchdog();

  return {
    dispose: () => {
      if (attemptTimer !== undefined) clearTimeout(attemptTimer);
      if (stallTimer !== undefined) clearTimeout(stallTimer);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
    notifyProgress: armStallWatchdog,
    signal: controller.signal,
  };
}

/** Sleeps between retry attempts, rejecting immediately when the job aborts. */
function sleepWithAbort(
  delayMs: number,
  signal: AbortSignal | undefined,
  job: TransferJob,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal === undefined) {
      setTimeout(resolve, delayMs);
      return;
    }

    if (signal.aborted) {
      reject(toAbortFailure(signal, job));
      return;
    }

    const rejectAbort = (): void => {
      clearTimeout(timer);
      reject(toAbortFailure(signal, job));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", rejectAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", rejectAbort, { once: true });
  });
}

/** Normalizes an aborted signal into the SDK error to surface for the job. */
function toAbortFailure(signal: AbortSignal, job: TransferJob): ZeroTransferError {
  if (signal.reason instanceof ZeroTransferError) {
    return signal.reason;
  }

  return new AbortError({
    details: { jobId: job.id, operation: job.operation },
    message: `Transfer job aborted: ${job.id}`,
    retryable: false,
  });
}

function normalizeDelayMs(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.floor(value);
}

function normalizeTimeoutMs(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return Math.floor(value);
}

async function runExecutor(
  executor: TransferExecutor,
  context: TransferExecutionContext,
  signal: AbortSignal | undefined,
  job: TransferJob,
): Promise<TransferExecutionResult> {
  if (signal === undefined) {
    return executor(context);
  }

  return Promise.race([executor(context), rejectWhenAborted(signal, job)]);
}

function rejectWhenAborted(
  signal: AbortSignal,
  job: TransferJob,
): Promise<TransferExecutionResult> {
  return new Promise((_, reject) => {
    const rejectAbort = (): void => {
      if (signal.reason instanceof ZeroTransferError) {
        reject(signal.reason);
        return;
      }

      reject(
        new AbortError({
          details: { jobId: job.id, operation: job.operation },
          message: `Transfer job aborted: ${job.id}`,
          retryable: false,
        }),
      );
    };

    if (signal.aborted) {
      rejectAbort();
      return;
    }

    signal.addEventListener("abort", rejectAbort, { once: true });
  });
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
  const verification = normalizeVerificationResult(result);
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
    verified: verification?.verified ?? result.verified ?? false,
    warnings: [...(result.warnings ?? [])],
  };

  if (job.source !== undefined) receipt.source = { ...job.source };
  if (job.destination !== undefined) receipt.destination = { ...job.destination };
  if (result.totalBytes !== undefined) receipt.totalBytes = result.totalBytes;
  else if (job.totalBytes !== undefined) receipt.totalBytes = job.totalBytes;
  if (result.checksum !== undefined) receipt.checksum = result.checksum;
  else if (verification?.checksum !== undefined) receipt.checksum = verification.checksum;
  if (verification !== undefined) receipt.verification = verification;
  if (job.metadata !== undefined) receipt.metadata = { ...job.metadata };

  return receipt;
}

function normalizeVerificationResult(
  result: TransferExecutionResult,
): TransferVerificationResult | undefined {
  const verification = result.verification;

  if (verification !== undefined) {
    const normalized: TransferVerificationResult = { verified: verification.verified };

    if (verification.method !== undefined) normalized.method = verification.method;
    if (verification.checksum !== undefined) normalized.checksum = verification.checksum;
    if (verification.expectedChecksum !== undefined) {
      normalized.expectedChecksum = verification.expectedChecksum;
    }
    if (verification.actualChecksum !== undefined)
      normalized.actualChecksum = verification.actualChecksum;
    if (verification.details !== undefined) normalized.details = { ...verification.details };

    return normalized;
  }

  if (result.verified === undefined && result.checksum === undefined) {
    return undefined;
  }

  const normalized: TransferVerificationResult = { verified: result.verified ?? false };

  if (result.checksum !== undefined) {
    normalized.checksum = result.checksum;
  }

  return normalized;
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
  if (error instanceof ZeroTransferError) {
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
  return error instanceof ZeroTransferError && error.retryable;
}

function calculateBytesPerSecond(bytes: number, durationMs: number): number {
  if (durationMs <= 0) {
    return bytes;
  }

  return bytes / (durationMs / 1000);
}
