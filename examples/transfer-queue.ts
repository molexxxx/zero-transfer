/**
 * @file Transfer queue with concurrency, progress, and per-job receipts.
 *
 * Builds a `TransferQueue` backed by `createProviderTransferExecutor`, opens
 * a single source and destination session up front, then drains a batch of
 * jobs with concurrency 4. Showcases progress streaming, success receipts,
 * and a graceful failure observer in one place.
 */
import {
  TransferQueue,
  createMemoryProviderFactory,
  createProviderTransferExecutor,
  createTransferClient,
  type ProviderTransferSessionResolverInput,
  type TransferJob,
  type TransferSession,
} from "@zero-transfer/core";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [
      createMemoryProviderFactory({
        entries: [
          { content: "report-1", path: "/source/report-1.csv", type: "file" },
          { content: "report-2", path: "/source/report-2.csv", type: "file" },
          { content: "report-3", path: "/source/report-3.csv", type: "file" },
          { content: "report-4", path: "/source/report-4.csv", type: "file" },
          { path: "/destination", type: "directory" },
        ],
      }),
    ],
  });

  const sourceSession = await client.connect({ host: "memory", provider: "memory" });
  const destinationSession = await client.connect({ host: "memory", provider: "memory" });

  const resolveSession = ({ role }: ProviderTransferSessionResolverInput): TransferSession =>
    role === "source" ? sourceSession : destinationSession;

  const executor = createProviderTransferExecutor({ resolveSession });

  const queue = new TransferQueue({
    concurrency: 4,
    executor,
    onError: (item, error) => console.error(`Failed ${item.id}: ${(error as Error).message}`),
    onProgress: (event) => console.log(`${event.transferId}: ${event.bytesTransferred} bytes`),
    onReceipt: (receipt) => console.log(`Completed ${receipt.jobId}`),
  });

  const jobs: TransferJob[] = ["report-1", "report-2", "report-3", "report-4"].map((name) => ({
    destination: { path: `/destination/${name}.csv`, provider: "memory" },
    id: `copy:${name}`,
    operation: "copy",
    source: { path: `/source/${name}.csv`, provider: "memory" },
  }));

  for (const job of jobs) queue.add(job);

  try {
    const summary = await queue.run();
    console.log(`Completed ${summary.completed}/${summary.total} (failures: ${summary.failed}).`);
  } finally {
    await Promise.allSettled([sourceSession.disconnect(), destinationSession.disconnect()]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
