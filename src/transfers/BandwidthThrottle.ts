/**
 * Token-bucket bandwidth throttle for transfer streams.
 *
 * @module transfers/BandwidthThrottle
 */
import { AbortError, ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferBandwidthLimit } from "./TransferJob";

/** Sleep helper signature used by {@link createBandwidthThrottle}. */
export type BandwidthSleep = (delayMs: number, signal?: AbortSignal) => Promise<void>;

/** Construction overrides for deterministic tests. */
export interface BandwidthThrottleOptions {
  /** Monotonic clock returning milliseconds since an arbitrary epoch. Defaults to `Date.now`. */
  now?: () => number;
  /** Sleep implementation honoring an optional abort signal. Defaults to a `setTimeout` helper. */
  sleep?: BandwidthSleep;
}

/** Token-bucket throttle used to pace transfer chunks. */
export interface BandwidthThrottle {
  /** Maximum sustained transfer rate in bytes per second. */
  readonly bytesPerSecond: number;
  /** Burst capacity in bytes available before throttling kicks in. */
  readonly burstBytes: number;
  /**
   * Consumes `bytes` from the bucket, awaiting refill when not enough tokens are available.
   *
   * @param bytes - Non-negative byte count being released by the throttle.
   * @param signal - Optional abort signal that interrupts pending waits.
   * @throws {@link AbortError} When the signal is aborted while waiting.
   */
  consume(bytes: number, signal?: AbortSignal): Promise<void>;
}

/**
 * Creates a token-bucket throttle that paces an asynchronous data pipeline to
 * a sustained {@link TransferBandwidthLimit}.
 *
 * Returns `undefined` when no limit is supplied so callers can omit throttling
 * without conditional branches at the call site.
 *
 * @param limit - Optional throughput limit. Returns `undefined` when omitted.
 * @param options - Optional clock/sleep overrides for deterministic tests.
 * @returns Throttle implementation when a limit is supplied, otherwise `undefined`.
 * @throws {@link ConfigurationError} When the supplied limit shape is invalid.
 */
export function createBandwidthThrottle(
  limit: TransferBandwidthLimit | undefined,
  options: BandwidthThrottleOptions = {},
): BandwidthThrottle | undefined {
  if (limit === undefined) return undefined;

  const bytesPerSecond = normalizeRate(limit.bytesPerSecond);
  const burstBytes = normalizeBurst(limit.burstBytes, bytesPerSecond);
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;

  let tokens = burstBytes;
  let lastRefillAt = now();

  function refill(): void {
    const current = now();
    const elapsedMs = Math.max(0, current - lastRefillAt);

    if (elapsedMs > 0) {
      tokens = Math.min(burstBytes, tokens + (elapsedMs / 1000) * bytesPerSecond);
      lastRefillAt = current;
    }
  }

  async function consume(bytes: number, signal?: AbortSignal): Promise<void> {
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new ConfigurationError({
        details: { bytes },
        message: "Bandwidth throttle byte count must be a non-negative number",
        retryable: false,
      });
    }

    if (bytes === 0) return;

    let remaining = bytes;

    while (remaining > 0) {
      throwIfAborted(signal);
      refill();

      if (tokens >= remaining) {
        tokens -= remaining;
        return;
      }

      if (tokens >= burstBytes) {
        // Bucket is full but the request still exceeds the burst. Drain the
        // full bucket and wait for the remainder at the sustained rate.
        const drained = tokens;
        tokens = 0;
        remaining -= drained;
        const waitMs = Math.ceil((Math.min(remaining, burstBytes) / bytesPerSecond) * 1000);
        await sleep(waitMs, signal);
        continue;
      }

      const deficit = Math.min(remaining, burstBytes) - tokens;
      const waitMs = Math.max(1, Math.ceil((deficit / bytesPerSecond) * 1000));
      await sleep(waitMs, signal);
    }
  }

  return { burstBytes, bytesPerSecond, consume };
}

/**
 * Wraps an async iterable of byte chunks so each chunk is released only after
 * the throttle has admitted its byte count.
 *
 * When `throttle` is `undefined`, the source iterable is returned unchanged.
 *
 * @param source - Async iterable that produces byte chunks.
 * @param throttle - Optional throttle that paces chunk emission.
 * @param signal - Optional abort signal interrupting pending waits.
 * @returns Async generator emitting the original chunks at the throttled rate.
 */
export function throttleByteIterable(
  source: AsyncIterable<Uint8Array>,
  throttle: BandwidthThrottle | undefined,
  signal?: AbortSignal,
): AsyncIterable<Uint8Array> {
  if (throttle === undefined) return source;

  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const chunk of source) {
        throwIfAborted(signal);
        if (chunk.byteLength > 0) {
          await throttle.consume(chunk.byteLength, signal);
        }
        yield chunk;
      }
    },
  };
}

function normalizeRate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigurationError({
      details: { bytesPerSecond: value },
      message: "Bandwidth limit bytesPerSecond must be a positive number",
      retryable: false,
    });
  }

  return value;
}

function normalizeBurst(value: number | undefined, bytesPerSecond: number): number {
  if (value === undefined) return bytesPerSecond;

  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigurationError({
      details: { burstBytes: value },
      message: "Bandwidth limit burstBytes must be a positive number when provided",
      retryable: false,
    });
  }

  return value;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) {
    throw new AbortError({
      message: "Bandwidth throttle wait aborted",
      retryable: false,
    });
  }
}

function defaultSleep(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (delayMs <= 0) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    const onAbort = () => {
      cleanup();
      reject(
        new AbortError({
          message: "Bandwidth throttle wait aborted",
          retryable: false,
        }),
      );
    };

    function cleanup(): void {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    if (signal !== undefined) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
