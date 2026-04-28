import { describe, expect, it, vi } from "vitest";
import {
  AbortError,
  ConfigurationError,
  createBandwidthThrottle,
  throttleByteIterable,
} from "../../../src/index";

describe("createBandwidthThrottle", () => {
  it("returns undefined when no limit is supplied", () => {
    expect(createBandwidthThrottle(undefined)).toBeUndefined();
  });

  it("rejects invalid bandwidth limits", () => {
    expect(() => createBandwidthThrottle({ bytesPerSecond: 0 })).toThrow(ConfigurationError);
    expect(() => createBandwidthThrottle({ bytesPerSecond: -1 })).toThrow(ConfigurationError);
    expect(() => createBandwidthThrottle({ burstBytes: -1, bytesPerSecond: 100 })).toThrow(
      ConfigurationError,
    );
  });

  it("admits bursts up to the bucket size without waiting", async () => {
    const sleep = vi.fn(() => Promise.resolve());
    const throttle = createBandwidthThrottle(
      { burstBytes: 1024, bytesPerSecond: 1024 },
      { now: () => 0, sleep },
    );

    await throttle?.consume(1024);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("waits for refill once the bucket is exhausted", async () => {
    const clock = { value: 0 };
    const sleep = vi.fn(async (delayMs: number) => {
      await Promise.resolve();
      clock.value += delayMs;
    });
    const throttle = createBandwidthThrottle(
      { burstBytes: 100, bytesPerSecond: 1000 },
      { now: () => clock.value, sleep },
    );

    await throttle?.consume(100);
    expect(sleep).not.toHaveBeenCalled();

    await throttle?.consume(50);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep.mock.calls[0]?.[0]).toBeGreaterThanOrEqual(50);
  });

  it("rejects negative byte counts", async () => {
    const throttle = createBandwidthThrottle(
      { bytesPerSecond: 1000 },
      { now: () => 0, sleep: () => Promise.resolve() },
    );

    await expect(throttle?.consume(-1)).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("aborts pending waits when the abort signal fires", async () => {
    const controller = new AbortController();
    const throttle = createBandwidthThrottle(
      { burstBytes: 1, bytesPerSecond: 1 },
      {
        now: () => 0,
        sleep: () =>
          new Promise<void>((_resolve, reject) => {
            controller.abort();
            reject(new AbortError({ message: "aborted", retryable: false }));
          }),
      },
    );

    await expect(throttle?.consume(10, controller.signal)).rejects.toBeInstanceOf(AbortError);
  });

  it("uses the default setTimeout sleep when no override is supplied", async () => {
    const throttle = createBandwidthThrottle({ burstBytes: 1, bytesPerSecond: 10_000 });
    await expect(throttle?.consume(2)).resolves.toBeUndefined();
  });

  it("rejects the default sleep when the abort signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const throttle = createBandwidthThrottle({ burstBytes: 1, bytesPerSecond: 10 });
    await expect(throttle?.consume(2, controller.signal)).rejects.toBeInstanceOf(AbortError);
  });

  it("rejects the default sleep when the abort signal aborts mid-wait", async () => {
    const controller = new AbortController();
    const throttle = createBandwidthThrottle({ burstBytes: 1, bytesPerSecond: 1 });
    const consume = throttle?.consume(1000, controller.signal);
    setTimeout(() => controller.abort(), 5);
    await expect(consume).rejects.toBeInstanceOf(AbortError);
  });
});

describe("throttleByteIterable", () => {
  it("returns the source unchanged when the throttle is undefined", () => {
    const source = createIterable([Uint8Array.of(1, 2, 3)]);
    const wrapped = throttleByteIterable(source, undefined);
    expect(wrapped).toBe(source);
  });

  it("consumes throttle tokens for each emitted chunk", async () => {
    const consume = vi.fn(async () => {
      await Promise.resolve();
    });
    const throttle = {
      burstBytes: 16,
      bytesPerSecond: 16,
      consume,
    };
    const wrapped = throttleByteIterable(
      createIterable([Uint8Array.of(1, 2), Uint8Array.of(3, 4, 5)]),
      throttle,
    );
    const collected: number[] = [];

    for await (const chunk of wrapped) {
      collected.push(...chunk);
    }

    expect(collected).toEqual([1, 2, 3, 4, 5]);
    expect(consume).toHaveBeenCalledTimes(2);
    const calls = consume.mock.calls as unknown as number[][];
    expect(calls[0]?.[0]).toBe(2);
    expect(calls[1]?.[0]).toBe(3);
  });

  it("aborts iteration when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const throttle = {
      burstBytes: 16,
      bytesPerSecond: 16,
      consume: vi.fn(() => Promise.resolve()),
    };
    const wrapped = throttleByteIterable(
      createIterable([Uint8Array.of(1)]),
      throttle,
      controller.signal,
    );
    const iterate = async () => {
      for await (const chunk of wrapped) {
        // intentionally empty: just exercising iteration to surface aborts
        void chunk;
      }
    };

    await expect(iterate()).rejects.toBeInstanceOf(AbortError);
    expect(throttle.consume).not.toHaveBeenCalled();
  });
});

async function* createIterable(chunks: Uint8Array[]): AsyncGenerator<Uint8Array> {
  for (const chunk of chunks) {
    await Promise.resolve();
    yield chunk;
  }
}
