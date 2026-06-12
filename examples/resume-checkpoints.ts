/**
 * @file Checkpoint/resume: interrupted transfers pick up where they left off.
 *
 * Demonstrates the unified checkpoint model end to end: a transfer whose
 * source connection "dies" mid-stream, the retry policy re-entering the
 * executor, and the second attempt resuming from the committed byte
 * watermark (a ranged read) instead of restarting - all in one
 * `engine.execute()` call. Checkpoints are keyed by source+destination path,
 * not job id, so the same store also resumes the transfer in a *fresh
 * process*: re-run after a crash and only the remaining bytes move. The
 * source is fingerprinted (size/mtime) when the checkpoint is written; if it
 * changes, the checkpoint is invalidated and the transfer restarts safely.
 * Runs entirely offline against the local-filesystem provider.
 *
 * For the friendly helpers (`uploadFile`, `downloadFile`, `copyBetween`) the
 * same behavior is one line of client config:
 *
 *   createTransferClient({ defaults: { resume: { store } } })
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ConnectionError,
  TransferEngine,
  createDefaultRetryPolicy,
  createFileSystemTransferCheckpointStore,
  createLocalProviderFactory,
  createProviderTransferExecutor,
  createTransferClient,
  redactErrorForLogging,
  type ProviderTransferReadRequest,
  type TransferJob,
  type TransferSession,
} from "@zero-transfer/core";

const workDir = await mkdtemp(join(tmpdir(), "zt-resume-example-"));
await writeFile(join(workDir, "big.bin"), Buffer.alloc(4 * 1024 * 1024, 7));

const client = createTransferClient({
  providers: [createLocalProviderFactory({ rootPath: workDir })],
});
const session = await client.connect({ host: workDir, provider: "local" });

// Simulate a flaky network: attempt 1's content stream dies after 256 KiB
// with a retryable error. Attempt 2 reads cleanly. The wrapper also logs the
// ranged read so the resume is visible.
const realTransfers = session.transfers;
if (realTransfers === undefined) throw new Error("local session has no transfers");
const flakySession: TransferSession = {
  ...session,
  transfers: {
    read: async (request: ProviderTransferReadRequest) => {
      console.log(
        `attempt ${String(request.attempt)}: reading from byte ${String(request.range?.offset ?? 0)}`,
      );
      const result = await realTransfers.read(request);
      if (request.attempt > 1) return result;
      return { ...result, content: dropAfter(result.content, 256 * 1024) };
    },
    write: (request) => realTransfers.write(request),
  },
};

async function* dropAfter(
  source: AsyncIterable<Uint8Array>,
  limitBytes: number,
): AsyncGenerator<Uint8Array> {
  let seen = 0;
  for await (const chunk of source) {
    yield chunk;
    seen += chunk.byteLength;
    if (seen >= limitBytes) {
      throw new ConnectionError({ message: "simulated connection drop", retryable: true });
    }
  }
}

// The filesystem store survives process restarts (atomic 0600 writes, 7-day
// TTL). Use createMemoryTransferCheckpointStore() when in-process retry
// resume is enough.
const executor = createProviderTransferExecutor({
  resolveSession: () => flakySession,
  resume: {
    store: createFileSystemTransferCheckpointStore({ directory: join(workDir, "checkpoints") }),
  },
});

const job: TransferJob = {
  destination: { path: "/big-copy.bin", provider: "local" },
  id: "resume-demo-1",
  operation: "copy",
  source: { path: "/big.bin", provider: "local" },
};

try {
  const receipt = await new TransferEngine().execute(job, executor, {
    retry: createDefaultRetryPolicy(),
  });

  // Attempt 1 recorded the failure; attempt 2 resumed from the watermark.
  console.log(
    `Resumed: ${String(receipt.resumed)} in ${String(receipt.attempts.length)} attempts.`,
  );
  for (const attempt of receipt.attempts) {
    const outcome = attempt.error ? `failed: ${attempt.error.message}` : "succeeded";
    console.log(`  attempt ${String(attempt.attempt)}: ${outcome}`);
  }
} catch (error) {
  console.error("Transfer failed:", redactErrorForLogging(error));
  process.exitCode = 1;
} finally {
  await session.disconnect();
  await rm(workDir, { force: true, recursive: true });
}
