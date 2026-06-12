import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ConfigurationError,
  ConnectionError,
  createFileSystemTransferBatchStateStore,
  createMemoryTransferBatchStateStore,
  createTransferPlan,
  deserializeTransferPlan,
  runResumableBatch,
  serializeTransferPlan,
  type TransferExecutor,
  type TransferPlan,
} from "../../../src/index";

function makePlan(stepCount = 4): TransferPlan {
  return createTransferPlan({
    dryRun: false,
    id: "batch-1",
    metadata: { reason: "nightly" },
    now: () => new Date("2026-06-12T00:00:00.000Z"),
    steps: [
      ...Array.from({ length: stepCount }, (_, index) => ({
        action: "upload" as const,
        destination: { path: `/dest/file-${String(index)}.bin`, provider: "dest" },
        expectedBytes: 100 + index,
        id: `step-${String(index)}`,
        source: { path: `/src/file-${String(index)}.bin`, provider: "src" },
      })),
      { action: "skip" as const, id: "skipped-step", reason: "up to date" },
    ],
    warnings: ["one warning"],
  });
}

describe("serializeTransferPlan / deserializeTransferPlan", () => {
  it("round-trips a plan through JSON", () => {
    const plan = makePlan();
    const revived = deserializeTransferPlan(serializeTransferPlan(plan));

    expect(revived).toEqual(plan);
    expect(revived.createdAt.getTime()).toBe(plan.createdAt.getTime());
  });

  it("rejects malformed input with typed errors", () => {
    expect(() => deserializeTransferPlan("{ not json")).toThrow(ConfigurationError);
    expect(() => deserializeTransferPlan('"a string"')).toThrow(ConfigurationError);
    expect(() => deserializeTransferPlan(JSON.stringify({ id: "x", version: 2 }))).toThrow(
      ConfigurationError,
    );
  });

  it("tolerates missing optional fields and invalid dates", () => {
    const minimal = deserializeTransferPlan(JSON.stringify({ id: "min", steps: [], version: 1 }));
    expect(minimal.id).toBe("min");
    expect(minimal.steps).toEqual([]);
    expect(minimal.dryRun).toBe(true);
    expect(minimal.warnings).toEqual([]);
    expect(minimal.metadata).toBeUndefined();
    expect(Number.isNaN(minimal.createdAt.getTime())).toBe(false);

    const badDate = deserializeTransferPlan(
      JSON.stringify({ createdAt: "not a date", id: "bad-date", steps: [], version: 1 }),
    );
    expect(Number.isNaN(badDate.createdAt.getTime())).toBe(false);
  });
});

describe("createFileSystemTransferBatchStateStore", () => {
  let directory: string | undefined;

  afterEach(async () => {
    if (directory !== undefined) {
      await rm(directory, { force: true, recursive: true });
      directory = undefined;
    }
  });

  it("treats corrupt or mismatched state files as absent", async () => {
    directory = await mkdtemp(join(tmpdir(), "zt-batch-"));
    const store = createFileSystemTransferBatchStateStore({ directory });
    await store.save({
      completedStepIds: ["step-0"],
      planId: "batch-1",
      updatedAtMs: Date.now(),
      version: 1,
    });
    const files = await readdir(directory);
    const file = join(directory, files[0] ?? "");

    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, "{ corrupt", "utf8");
    expect(await store.load("batch-1")).toBeUndefined();

    await writeFile(
      file,
      JSON.stringify({ completedStepIds: [], planId: "OTHER", updatedAtMs: 1, version: 1 }),
      "utf8",
    );
    expect(await store.load("batch-1")).toBeUndefined();
  });

  it("round-trips batch state atomically and validates on load", async () => {
    directory = await mkdtemp(join(tmpdir(), "zt-batch-"));
    const store = createFileSystemTransferBatchStateStore({ directory });

    await store.save({
      completedStepIds: ["step-0", "step-1"],
      planId: "batch-1",
      updatedAtMs: Date.now(),
      version: 1,
    });
    const files = await readdir(directory);
    expect(files).toHaveLength(1);
    expect(files.some((file) => file.endsWith(".tmp"))).toBe(false);

    const loaded = await store.load("batch-1");
    expect(loaded?.completedStepIds).toEqual(["step-0", "step-1"]);
    expect(await store.load("other-plan")).toBeUndefined();

    await store.clear("batch-1");
    expect(await store.load("batch-1")).toBeUndefined();
    await store.clear("batch-1");
  });

  it("requires a directory", () => {
    expect(() => createFileSystemTransferBatchStateStore({ directory: "" })).toThrow(
      ConfigurationError,
    );
  });
});

describe("runResumableBatch", () => {
  function makeExecutor(failStepIds: Set<string>): { executor: TransferExecutor; ran: string[] } {
    const ran: string[] = [];
    const executor: TransferExecutor = ({ job }) => {
      const stepId = job.id.split(":")[1] ?? "";
      ran.push(stepId);
      if (failStepIds.has(stepId)) {
        throw new ConnectionError({ message: `step ${stepId} failed`, retryable: true });
      }
      return { bytesTransferred: job.totalBytes ?? 0 };
    };
    return { executor, ran };
  }

  it("completes a fresh batch, persists progress, and clears state at the end", async () => {
    const store = createMemoryTransferBatchStateStore();
    const { executor, ran } = makeExecutor(new Set());

    const result = await runResumableBatch({
      batchStore: store,
      executor,
      plan: makePlan(),
    });

    expect(result.complete).toBe(true);
    expect(result.previouslyCompletedStepIds).toEqual([]);
    expect(result.completedStepIds).toEqual(["step-0", "step-1", "step-2", "step-3"]);
    expect(result.remainingStepIds).toEqual([]);
    expect(result.summary.completed).toBe(4);
    expect(ran).toEqual(["step-0", "step-1", "step-2", "step-3"]);
    // Skip steps never execute; state is cleared on completion.
    expect(ran).not.toContain("skipped-step");
    expect(await store.load("batch-1")).toBeUndefined();
  });

  it("persists completions when a step fails and resumes the remainder on re-run", async () => {
    const store = createMemoryTransferBatchStateStore();
    const firstRun = makeExecutor(new Set(["step-2"]));

    const partial = await runResumableBatch({
      batchStore: store,
      executor: firstRun.executor,
      plan: makePlan(),
    });

    expect(partial.complete).toBe(false);
    expect(partial.completedStepIds).toEqual(["step-0", "step-1", "step-3"]);
    expect(partial.remainingStepIds).toEqual(["step-2"]);
    expect(partial.summary.failed).toBe(1);
    expect((await store.load("batch-1"))?.completedStepIds).toEqual(["step-0", "step-1", "step-3"]);

    // Second run (fresh process in real life): only the failed step re-runs.
    const secondRun = makeExecutor(new Set());
    const resumed = await runResumableBatch({
      batchStore: store,
      executor: secondRun.executor,
      plan: makePlan(),
    });

    expect(secondRun.ran).toEqual(["step-2"]);
    expect(resumed.previouslyCompletedStepIds).toEqual(["step-0", "step-1", "step-3"]);
    expect(resumed.complete).toBe(true);
    expect(resumed.remainingStepIds).toEqual([]);
    expect(await store.load("batch-1")).toBeUndefined();
  });

  it("runs steps concurrently while recording completions safely", async () => {
    const store = createMemoryTransferBatchStateStore();
    let inFlight = 0;
    let maxInFlight = 0;
    const executor: TransferExecutor = async ({ job }) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { bytesTransferred: job.totalBytes ?? 0 };
    };

    const result = await runResumableBatch({
      batchStore: store,
      concurrency: 3,
      executor,
      plan: makePlan(6),
    });

    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(result.complete).toBe(true);
    expect(result.completedStepIds).toHaveLength(6);
  });

  it("threads every optional queue option through to execution", async () => {
    const store = createMemoryTransferBatchStateStore();
    const progressJobs: string[] = [];
    const receipts: string[] = [];
    const errors: string[] = [];
    const { TransferEngine, createTransferClient, createDefaultRetryPolicy } =
      await import("../../../src/index");
    const executor: TransferExecutor = (context) => {
      const { job } = context;
      context.reportProgress(1, job.totalBytes);
      const stepId = job.id.split(":")[1] ?? "";
      if (stepId === "step-1") {
        throw new ConnectionError({ message: "boom", retryable: false });
      }
      return { bytesTransferred: job.totalBytes ?? 0 };
    };

    const result = await runResumableBatch({
      bandwidthLimit: { bytesPerSecond: 1_000_000 },
      batchStore: store,
      client: createTransferClient(),
      concurrency: 2,
      engine: new TransferEngine(),
      executor,
      onError: (item) => errors.push(item.id),
      onProgress: (event) => progressJobs.push(event.transferId),
      onReceipt: (receipt) => receipts.push(receipt.jobId),
      plan: makePlan(3),
      retry: createDefaultRetryPolicy({ maxAttempts: 1 }),
      signal: new AbortController().signal,
      timeout: { timeoutMs: 60_000 },
    });

    expect(result.complete).toBe(false);
    expect(result.remainingStepIds).toEqual(["step-1"]);
    expect(receipts.sort()).toEqual(["batch-1:step-0", "batch-1:step-2"]);
    expect(errors).toEqual(["batch-1:step-1"]);
    expect(progressJobs.length).toBeGreaterThan(0);
  });

  it("round-trips through plan serialization for cross-process resume", async () => {
    const store = createMemoryTransferBatchStateStore();
    const serialized = serializeTransferPlan(makePlan());

    const firstRun = makeExecutor(new Set(["step-1"]));
    await runResumableBatch({
      batchStore: store,
      executor: firstRun.executor,
      plan: deserializeTransferPlan(serialized),
    });

    const secondRun = makeExecutor(new Set());
    const resumed = await runResumableBatch({
      batchStore: store,
      executor: secondRun.executor,
      plan: deserializeTransferPlan(serialized),
    });

    expect(secondRun.ran).toEqual(["step-1"]);
    expect(resumed.complete).toBe(true);
  });
});
