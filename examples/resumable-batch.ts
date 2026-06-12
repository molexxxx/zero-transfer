/**
 * @file Resumable batch jobs: crash-safe execution of a whole transfer plan.
 *
 * Demonstrates whole-job checkpointing with `runResumableBatch`: a plan of
 * many files runs through the bounded-concurrency queue, every completed step
 * is recorded in a batch state store, and re-running the same plan skips the
 * steps that already succeeded - only the failed/remaining work re-executes.
 * Pair the executor with a checkpoint store (see `resume-checkpoints.ts`) and
 * the file that was interrupted mid-transfer resumes at the byte level too.
 * Plans serialize to JSON (`serializeTransferPlan`) so a fresh process can
 * reload and resume the exact same batch. Runs entirely offline against the
 * in-memory provider.
 */
import {
  createMemoryProviderFactory,
  createMemoryTransferBatchStateStore,
  createProviderTransferExecutor,
  createTransferClient,
  createTransferPlan,
  deserializeTransferPlan,
  runResumableBatch,
  serializeTransferPlan,
  ConnectionError,
  type TransferExecutor,
} from "@zero-transfer/core";

const files = ["alpha.bin", "bravo.bin", "charlie.bin", "delta.bin"];
const client = createTransferClient({
  providers: [
    createMemoryProviderFactory({
      entries: [
        ...files.map((name) => ({
          content: `payload of ${name}`,
          path: `/outbox/${name}`,
          type: "file" as const,
        })),
        { path: "/inbox", type: "directory" as const },
      ],
    }),
  ],
});

// Plans are plain data: build one (here by hand; createSyncPlan and
// createAtomicDeployPlan produce them too), persist it, reload it anywhere.
const plan = createTransferPlan({
  dryRun: false,
  id: "nightly-export",
  steps: files.map((name) => ({
    action: "upload" as const,
    destination: { path: `/inbox/${name}`, provider: "memory" },
    id: name,
    source: { path: `/outbox/${name}`, provider: "memory" },
  })),
});
const planFile = serializeTransferPlan(plan);

const session = await client.connect({ host: "memory", provider: "memory" });
const providerExecutor = createProviderTransferExecutor({
  // Add `resume: { store }` here for byte-level resume of interrupted files.
  resolveSession: () => session,
});

// Simulate a flaky first run: charlie.bin fails once, then behaves.
let charlieFailures = 1;
const flakyExecutor: TransferExecutor = (context) => {
  if (context.job.id.endsWith(":charlie.bin") && charlieFailures > 0) {
    charlieFailures -= 1;
    throw new ConnectionError({ message: "simulated mid-batch crash", retryable: true });
  }
  return providerExecutor(context);
};

// Both runs are the same call - runResumableBatch is idempotent. The batch
// store records each completed step; a re-run (same process or a new one)
// skips them and executes only what is left.
const batchStore = createMemoryTransferBatchStateStore();

const firstRun = await runResumableBatch({
  batchStore,
  concurrency: 2,
  executor: flakyExecutor,
  plan: deserializeTransferPlan(planFile),
});
console.log(
  `First run: ${String(firstRun.summary.completed)} steps done, ` +
    `remaining: [${firstRun.remainingStepIds.join(", ")}]`,
);

const secondRun = await runResumableBatch({
  batchStore,
  concurrency: 2,
  executor: flakyExecutor,
  plan: deserializeTransferPlan(planFile),
});
console.log(
  `Second run: skipped ${String(secondRun.previouslyCompletedStepIds.length)} completed steps, ` +
    `batch complete: ${String(secondRun.complete)}`,
);

await session.disconnect();
