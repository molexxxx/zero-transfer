/**
 * Production-ready retry policy with exponential backoff and full jitter.
 *
 * @module transfers/createDefaultRetryPolicy
 */
import { ZeroTransferError } from "../errors/ZeroTransferError";
import type { TransferRetryDecisionInput, TransferRetryPolicy } from "./TransferEngine";

/** Options for {@link createDefaultRetryPolicy}. */
export interface DefaultRetryPolicyOptions {
  /** Maximum total attempts, including the first attempt. Defaults to `4`. */
  maxAttempts?: number;
  /** Base backoff delay before jitter in milliseconds. Defaults to `250`. */
  baseDelayMs?: number;
  /** Upper bound for a single computed backoff delay in milliseconds. Defaults to `30_000`. */
  maxDelayMs?: number;
  /**
   * Total elapsed-time budget across all attempts and delays in milliseconds.
   * Once exceeded, no further retries are attempted. Defaults to `300_000` (5 minutes).
   */
  maxElapsedMs?: number;
  /**
   * Random source in `[0, 1)` used for jitter. Defaults to `Math.random`.
   * Inject a deterministic source in tests.
   */
  random?: () => number;
}

const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 30_000;
const DEFAULT_MAX_ELAPSED_MS = 300_000;

/**
 * Creates the SDK's recommended retry policy for transfer execution.
 *
 * The policy retries only failures the SDK has marked as safe to retry
 * (`error.retryable === true` on a {@link ZeroTransferError}), backing off
 * exponentially with full jitter: each delay is drawn uniformly from
 * `[0, min(maxDelayMs, baseDelayMs * 2^(attempt - 1)))`, the schedule that
 * minimizes contention when many clients retry against the same server.
 *
 * Server pacing hints are honored: when the failed attempt carries
 * `details.retryAfterMs` (parsed from an HTTP `Retry-After` header on 429/503
 * responses by the web-family providers), the next delay is exactly that
 * value rather than the jittered backoff. A hint that does not fit in the
 * remaining `maxElapsedMs` budget stops retrying instead of retrying early.
 *
 * Retries also stop once `maxElapsedMs` has elapsed since execution started,
 * regardless of how many attempts remain.
 *
 * @param options - Optional overrides for attempts, delays, and the elapsed budget.
 * @returns A {@link TransferRetryPolicy} for {@link TransferEngine.execute},
 *   {@link runRoute}, {@link TransferQueue}, or client-level defaults.
 *
 * @example Default policy on a one-shot helper
 * ```ts
 * import { createDefaultRetryPolicy, uploadFile } from "@zero-transfer/sdk";
 *
 * await uploadFile({
 *   client,
 *   destination: { path: "/uploads/report.csv", profile },
 *   localPath: "./out/report.csv",
 *   retry: createDefaultRetryPolicy(),
 * });
 * ```
 *
 * @example Tighter schedule for latency-sensitive work
 * ```ts
 * const retry = createDefaultRetryPolicy({
 *   maxAttempts: 3,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
 *   maxElapsedMs: 15_000,
 * });
 * ```
 *
 * @see {@link TransferRetryPolicy} for the underlying hook contract.
 */
export function createDefaultRetryPolicy(
  options: DefaultRetryPolicyOptions = {},
): TransferRetryPolicy {
  const maxAttempts = normalizePositiveInteger(options.maxAttempts, DEFAULT_MAX_ATTEMPTS);
  const baseDelayMs = normalizeNonNegative(options.baseDelayMs, DEFAULT_BASE_DELAY_MS);
  const maxDelayMs = normalizeNonNegative(options.maxDelayMs, DEFAULT_MAX_DELAY_MS);
  const maxElapsedMs = normalizeNonNegative(options.maxElapsedMs, DEFAULT_MAX_ELAPSED_MS);
  const random = options.random ?? Math.random;

  return {
    getDelayMs(input: TransferRetryDecisionInput): number {
      const retryAfterMs = readRetryAfterMs(input.error);
      if (retryAfterMs !== undefined) {
        return retryAfterMs;
      }

      const exponentialMs = baseDelayMs * 2 ** (input.attempt - 1);
      const cappedMs = Math.min(maxDelayMs, exponentialMs);
      return Math.floor(random() * cappedMs);
    },
    maxAttempts,
    shouldRetry(input: TransferRetryDecisionInput): boolean {
      if (!(input.error instanceof ZeroTransferError) || !input.error.retryable) {
        return false;
      }

      if (input.elapsedMs >= maxElapsedMs) {
        return false;
      }

      const retryAfterMs = readRetryAfterMs(input.error);
      if (retryAfterMs !== undefined && input.elapsedMs + retryAfterMs > maxElapsedMs) {
        return false;
      }

      return true;
    },
  };
}

/** Reads a server-provided `Retry-After` hint from a failed attempt's error details. */
function readRetryAfterMs(error: unknown): number | undefined {
  if (!(error instanceof ZeroTransferError)) return undefined;
  const value = error.details?.["retryAfterMs"];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  return Math.floor(value);
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function normalizeNonNegative(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.floor(value);
}
