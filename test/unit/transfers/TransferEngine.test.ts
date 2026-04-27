import { describe, expect, it, vi } from "vitest";
import {
  AbortError,
  ConnectionError,
  TimeoutError,
  TransferEngine,
  TransferError,
  type TransferJob,
} from "../../../src/index";

const uploadJob: TransferJob = {
  destination: { path: "/remote/report.csv", provider: "memory" },
  id: "job-1",
  metadata: { batch: "alpha" },
  operation: "upload",
  source: { path: "./report.csv", provider: "local" },
  totalBytes: 100,
};

function createClock(): () => Date {
  const timestamps = [
    "2026-04-27T00:00:00.000Z",
    "2026-04-27T00:00:00.000Z",
    "2026-04-27T00:00:00.500Z",
    "2026-04-27T00:00:01.000Z",
    "2026-04-27T00:00:01.000Z",
  ].map((value) => new Date(value));
  let index = 0;

  return () => timestamps[Math.min(index++, timestamps.length - 1)]!;
}

describe("TransferEngine", () => {
  it("executes a transfer job and returns an audit receipt", async () => {
    const onProgress = vi.fn();
    const engine = new TransferEngine({ now: createClock() });
    const receipt = await engine.execute(
      uploadJob,
      (context) => {
        const event = context.reportProgress(50);

        expect(event).toMatchObject({
          bytesTransferred: 50,
          percent: 50,
          totalBytes: 100,
          transferId: "job-1",
        });
        expect(context.bandwidthLimit).toEqual({ bytesPerSecond: 512, burstBytes: 1024 });

        return {
          bytesTransferred: 100,
          verification: {
            checksum: "sha256:abc",
            method: "checksum",
            verified: true,
          },
          warnings: ["verified by fixture"],
        };
      },
      { bandwidthLimit: { bytesPerSecond: 512, burstBytes: 1024 }, onProgress },
    );

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ bytesTransferred: 50, totalBytes: 100, transferId: "job-1" }),
    );
    expect(receipt).toMatchObject({
      attempts: [{ attempt: 1, bytesTransferred: 100, durationMs: 1000 }],
      averageBytesPerSecond: 100,
      bytesTransferred: 100,
      checksum: "sha256:abc",
      destination: { path: "/remote/report.csv", provider: "memory" },
      durationMs: 1000,
      jobId: "job-1",
      metadata: { batch: "alpha" },
      operation: "upload",
      resumed: false,
      source: { path: "./report.csv", provider: "local" },
      totalBytes: 100,
      transferId: "job-1",
      verification: { checksum: "sha256:abc", method: "checksum", verified: true },
      verified: true,
      warnings: ["verified by fixture"],
    });
  });

  it("retries retryable failures and records attempt history", async () => {
    const onRetry = vi.fn();
    const engine = new TransferEngine({
      now: () => new Date("2026-04-27T00:00:00.000Z"),
    });
    let attemptCount = 0;

    const receipt = await engine.execute(
      uploadJob,
      (context) => {
        attemptCount += 1;
        context.reportProgress(attemptCount * 10);

        if (attemptCount === 1) {
          throw new ConnectionError({ message: "temporary outage", retryable: true });
        }

        return { bytesTransferred: 100, resumed: true };
      },
      { retry: { maxAttempts: 2, onRetry } },
    );

    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ attempt: 1, job: uploadJob }));
    expect(receipt.attempts).toHaveLength(2);
    expect(receipt.attempts[0]).toMatchObject({
      attempt: 1,
      bytesTransferred: 10,
      error: { code: "ZERO_TRANSFER_CONNECTION_ERROR", retryable: true },
    });
    expect(receipt.attempts[1]).toMatchObject({ attempt: 2, bytesTransferred: 100 });
    expect(receipt.resumed).toBe(true);
  });

  it("uses custom retry decisions", async () => {
    const engine = new TransferEngine({
      now: () => new Date("2026-04-27T00:00:00.000Z"),
    });
    let attemptCount = 0;

    const receipt = await engine.execute(
      uploadJob,
      () => {
        attemptCount += 1;

        if (attemptCount === 1) {
          throw new Error("plain transient error");
        }

        return { bytesTransferred: 7, totalBytes: 7 };
      },
      { retry: { maxAttempts: 2, shouldRetry: ({ attempt }) => attempt === 1 } },
    );

    expect(receipt.attempts).toHaveLength(2);
    expect(receipt.bytesTransferred).toBe(7);
    expect(receipt.totalBytes).toBe(7);
  });

  it("raises abort errors before or during execution", async () => {
    const engine = new TransferEngine();
    const controller = new AbortController();

    controller.abort();

    await expect(
      engine.execute(uploadJob, () => ({ bytesTransferred: 1 }), { signal: controller.signal }),
    ).rejects.toBeInstanceOf(AbortError);

    const midFlightController = new AbortController();

    await expect(
      engine.execute(
        uploadJob,
        (context) => {
          midFlightController.abort();
          context.throwIfAborted();
          return { bytesTransferred: 1 };
        },
        { signal: midFlightController.signal },
      ),
    ).rejects.toBeInstanceOf(AbortError);
  });

  it("raises timeout errors for stalled execution", async () => {
    const engine = new TransferEngine();

    await expect(
      engine.execute(uploadJob, () => new Promise<never>(() => undefined), {
        timeout: { retryable: false, timeoutMs: 1 },
      }),
    ).rejects.toBeInstanceOf(TimeoutError);

    await expect(
      engine.execute(uploadJob, () => new Promise<never>(() => undefined), {
        timeout: { retryable: false, timeoutMs: 1 },
      }),
    ).rejects.toMatchObject({
      code: "ZERO_TRANSFER_TIMEOUT",
      details: { jobId: "job-1", operation: "upload", timeoutMs: 1 },
      retryable: false,
    });
  });

  it("wraps exhausted failures with transfer attempt details", async () => {
    const engine = new TransferEngine({
      now: () => new Date("2026-04-27T00:00:00.000Z"),
    });

    let error: unknown;

    try {
      await engine.execute(
        uploadJob,
        () => {
          throw new Error("disk full");
        },
        { retry: { maxAttempts: 2, shouldRetry: () => false } },
      );
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(TransferError);

    const transferError = error as TransferError;
    expect(transferError.details).toMatchObject({
      attempts: [{ attempt: 1, error: { message: "disk full", name: "Error" } }],
      jobId: "job-1",
      operation: "upload",
    });
  });
});
