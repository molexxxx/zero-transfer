import { describe, expect, it } from "vitest";
import {
  ConnectionError,
  TimeoutError,
  createDefaultRetryPolicy,
  type TransferJob,
  type TransferRetryDecisionInput,
} from "../../../src/index";

const job: TransferJob = {
  destination: { path: "/remote/data.bin", provider: "memory" },
  id: "job-retry",
  operation: "upload",
  source: { path: "./data.bin", provider: "local" },
};

function decisionInput(overrides: Partial<TransferRetryDecisionInput>): TransferRetryDecisionInput {
  return {
    attempt: 1,
    elapsedMs: 0,
    error: new ConnectionError({ message: "transient", retryable: true }),
    job,
    ...overrides,
  };
}

describe("createDefaultRetryPolicy", () => {
  it("defaults to four total attempts", () => {
    expect(createDefaultRetryPolicy().maxAttempts).toBe(4);
    expect(createDefaultRetryPolicy({ maxAttempts: 2 }).maxAttempts).toBe(2);
  });

  it("retries only SDK errors marked retryable", () => {
    const policy = createDefaultRetryPolicy();

    expect(policy.shouldRetry?.(decisionInput({}))).toBe(true);
    expect(
      policy.shouldRetry?.(
        decisionInput({ error: new ConnectionError({ message: "fatal", retryable: false }) }),
      ),
    ).toBe(false);
    expect(policy.shouldRetry?.(decisionInput({ error: new Error("plain") }))).toBe(false);
    expect(policy.shouldRetry?.(decisionInput({ error: "string failure" }))).toBe(false);
  });

  it("retries retryable timeout errors (attempt-scope stalls and timeouts)", () => {
    const policy = createDefaultRetryPolicy();
    const stall = new TimeoutError({ message: "stalled", retryable: true });

    expect(policy.shouldRetry?.(decisionInput({ error: stall }))).toBe(true);
  });

  it("stops retrying once the elapsed budget is exhausted", () => {
    const policy = createDefaultRetryPolicy({ maxElapsedMs: 10_000 });

    expect(policy.shouldRetry?.(decisionInput({ elapsedMs: 9_999 }))).toBe(true);
    expect(policy.shouldRetry?.(decisionInput({ elapsedMs: 10_000 }))).toBe(false);
    expect(policy.shouldRetry?.(decisionInput({ elapsedMs: 60_000 }))).toBe(false);
  });

  it("declines retries whose Retry-After hint does not fit the remaining budget", () => {
    const policy = createDefaultRetryPolicy({ maxElapsedMs: 10_000 });
    const rateLimited = new ConnectionError({
      details: { retryAfterMs: 6_000 },
      message: "throttled",
      retryable: true,
    });

    expect(policy.shouldRetry?.(decisionInput({ elapsedMs: 3_000, error: rateLimited }))).toBe(
      true,
    );
    expect(policy.shouldRetry?.(decisionInput({ elapsedMs: 5_000, error: rateLimited }))).toBe(
      false,
    );
  });

  it("computes exponential backoff with full jitter", () => {
    const policy = createDefaultRetryPolicy({ random: () => 0.5 });

    expect(policy.getDelayMs?.(decisionInput({ attempt: 1 }))).toBe(125);
    expect(policy.getDelayMs?.(decisionInput({ attempt: 2 }))).toBe(250);
    expect(policy.getDelayMs?.(decisionInput({ attempt: 3 }))).toBe(500);
    expect(policy.getDelayMs?.(decisionInput({ attempt: 4 }))).toBe(1000);
  });

  it("caps the backoff window at maxDelayMs", () => {
    const policy = createDefaultRetryPolicy({ random: () => 0.5 });

    // 250ms * 2^9 = 128s, far past the 30s cap; jitter draws from [0, 30s).
    expect(policy.getDelayMs?.(decisionInput({ attempt: 10 }))).toBe(15_000);
  });

  it("draws jitter from the full window including zero", () => {
    const eager = createDefaultRetryPolicy({ random: () => 0 });
    const patient = createDefaultRetryPolicy({ random: () => 0.999 });

    expect(eager.getDelayMs?.(decisionInput({ attempt: 3 }))).toBe(0);
    expect(patient.getDelayMs?.(decisionInput({ attempt: 1 }))).toBe(Math.floor(0.999 * 250));
  });

  it("honors a server Retry-After hint verbatim, bypassing jitter and cap", () => {
    const policy = createDefaultRetryPolicy({ random: () => 0.5 });
    const rateLimited = new ConnectionError({
      details: { retryAfterMs: 45_000 },
      message: "throttled",
      retryable: true,
    });

    expect(policy.getDelayMs?.(decisionInput({ error: rateLimited }))).toBe(45_000);
  });

  it("ignores invalid Retry-After hints and falls back to backoff", () => {
    const policy = createDefaultRetryPolicy({ random: () => 0.5 });
    const negative = new ConnectionError({
      details: { retryAfterMs: -1 },
      message: "bad hint",
      retryable: true,
    });
    const nonNumeric = new ConnectionError({
      details: { retryAfterMs: "soon" },
      message: "bad hint",
      retryable: true,
    });

    expect(policy.getDelayMs?.(decisionInput({ attempt: 1, error: negative }))).toBe(125);
    expect(policy.getDelayMs?.(decisionInput({ attempt: 1, error: nonNumeric }))).toBe(125);
  });

  it("normalizes invalid construction options to the documented defaults", () => {
    const policy = createDefaultRetryPolicy({
      baseDelayMs: Number.NaN,
      maxAttempts: 0,
      maxDelayMs: -1,
      maxElapsedMs: Number.POSITIVE_INFINITY,
    });

    expect(policy.maxAttempts).toBe(4);
    // baseDelayMs/maxDelayMs fall back to 250/30_000.
    const half = createDefaultRetryPolicy({ baseDelayMs: Number.NaN, random: () => 0.5 });
    expect(half.getDelayMs?.(decisionInput({ attempt: 1 }))).toBe(125);
  });
});
