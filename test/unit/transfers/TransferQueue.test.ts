import { describe, expect, it, vi } from "vitest";
import {
  ConfigurationError,
  TransferQueue,
  type TransferExecutor,
  type TransferJob,
  type TransferProgressEvent,
  type TransferReceipt,
} from "../../../src/index";

function createJob(id: string): TransferJob {
  return {
    destination: { path: `/dest/${id}.txt`, provider: "memory" },
    id,
    operation: "upload",
    source: { path: `./${id}.txt`, provider: "local" },
    totalBytes: 1,
  };
}

describe("TransferQueue", () => {
  it("drains queued jobs with configured concurrency and receipts", async () => {
    const progressEvents: TransferProgressEvent[] = [];
    const receipts: TransferReceipt[] = [];
    let activeExecutors = 0;
    let maxActiveExecutors = 0;
    const executor: TransferExecutor = async (context) => {
      expect(context.bandwidthLimit).toEqual({ bytesPerSecond: 256 });
      activeExecutors += 1;
      maxActiveExecutors = Math.max(maxActiveExecutors, activeExecutors);
      context.reportProgress(1);
      await Promise.resolve();
      activeExecutors -= 1;
      return { bytesTransferred: 1, verified: true };
    };
    const queue = new TransferQueue({
      concurrency: 2,
      bandwidthLimit: { bytesPerSecond: 256 },
      executor,
      onProgress: (event) => progressEvents.push(event),
      onReceipt: (receipt) => receipts.push(receipt),
    });

    queue.add(createJob("job-1"));
    queue.add(createJob("job-2"));
    queue.add(createJob("job-3"));

    const summary = await queue.run();

    expect(maxActiveExecutors).toBe(2);
    expect(summary).toMatchObject({
      canceled: 0,
      completed: 3,
      failed: 0,
      queued: 0,
      running: 0,
      total: 3,
    });
    expect(summary.receipts.map((receipt) => receipt.jobId)).toEqual(["job-1", "job-2", "job-3"]);
    expect(progressEvents.map((event) => event.transferId)).toEqual(["job-1", "job-2", "job-3"]);
    expect(receipts).toHaveLength(3);
  });

  it("pauses, resumes, and cancels queued jobs", async () => {
    const queue = new TransferQueue({
      executor: () => ({ bytesTransferred: 1 }),
    });

    queue.add(createJob("job-1"));
    queue.pause();

    await expect(queue.run()).resolves.toMatchObject({ queued: 1, completed: 0 });
    expect(queue.cancel("job-1")).toBe(true);
    queue.resume();

    await expect(queue.run()).resolves.toMatchObject({ canceled: 1, completed: 0, queued: 0 });
    expect(queue.get("job-1")?.status).toBe("canceled");
    expect(queue.cancel("job-1")).toBe(false);
  });

  it("records failed jobs without rejecting the drain", async () => {
    const onError = vi.fn();
    const queue = new TransferQueue({ onError });

    queue.add(createJob("job-1"));

    const summary = await queue.run();
    const failedItem = queue.get("job-1");

    expect(summary).toMatchObject({ failed: 1, queued: 0, total: 1 });
    expect(failedItem?.status).toBe("failed");
    expect(failedItem?.error).toMatchObject({ code: "ZERO_TRANSFER_CONFIGURATION_ERROR" });
    expect(onError).toHaveBeenCalledOnce();
  });

  it("cancels running jobs when the drain signal aborts", async () => {
    const controller = new AbortController();
    const executor: TransferExecutor = (context) => {
      controller.abort();
      context.throwIfAborted();
      return { bytesTransferred: 1 };
    };
    const queue = new TransferQueue({ executor });

    queue.add(createJob("job-1"));

    const summary = await queue.run({ signal: controller.signal });

    expect(summary).toMatchObject({ canceled: 1, failed: 0, queued: 0 });
    expect(queue.get("job-1")?.status).toBe("canceled");
  });

  it("rejects duplicate jobs and normalizes queue snapshots", () => {
    const queue = new TransferQueue({ executor: () => ({ bytesTransferred: 1 }) });
    const job = createJob("job-1");

    queue.add(job);
    job.source = { path: "./mutated.txt", provider: "local" };

    expect(queue.list()[0]?.job.source).toEqual({ path: "./job-1.txt", provider: "local" });
    expect(() => queue.add(createJob("job-1"))).toThrow(ConfigurationError);
    expect(() => queue.setConcurrency(0)).not.toThrow();
    expect(() => queue.setConcurrency(Number.NaN)).not.toThrow();
  });
});
