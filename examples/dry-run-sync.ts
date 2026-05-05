/**
 * @file Dry-run sync planner.
 *
 * Walks an SFTP source and a local destination, diffs the trees, and
 * prints the resulting `TransferPlan` without performing any I/O. Use this
 * pattern in CI to preview a deployment or surface drift without risking
 * mutation on the destination side.
 */
import {
  createLocalProviderFactory,
  createSftpProviderFactory,
  createSyncPlan,
  createTransferClient,
  diffRemoteTrees,
  summarizeTransferPlan,
  type ConnectionProfile,
} from "@zero-transfer/sftp";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createLocalProviderFactory({ rootPath: "./mirror" }), createSftpProviderFactory()],
  });

  const remote: ConnectionProfile = {
    host: "files.example.com",
    password: { env: "SFTP_PASSWORD" },
    provider: "sftp",
    username: "mirror-bot",
  };
  const local: ConnectionProfile = { host: "local", provider: "local" };

  const sourceSession = await client.connect(remote);
  const destSession = await client.connect(local);
  try {
    const diff = await diffRemoteTrees(sourceSession.fs, "/exports", destSession.fs, "/", {
      walk: { maxDepth: 4 },
    });
    const plan = createSyncPlan({
      conflictPolicy: "prefer-destination",
      deletePolicy: "never",
      destination: { provider: "local", rootPath: "/" },
      diff,
      dryRun: true,
      id: "nightly-mirror",
      source: { provider: "sftp", rootPath: "/exports" },
    });

    const summary = summarizeTransferPlan(plan);
    console.log(`Plan: ${plan.id}`);
    console.log(`  Steps: ${summary.totalSteps}`);
    console.log(`  Executable: ${summary.executableSteps} (${summary.totalExpectedBytes} bytes)`);
    console.log(`  Skipped: ${summary.skippedSteps}`);
    for (const step of plan.steps.slice(0, 10)) {
      console.log(
        `  - ${step.action} ${step.source?.path ?? ""} -> ${step.destination?.path ?? ""}`,
      );
    }
  } finally {
    await Promise.allSettled([sourceSession.disconnect(), destSession.disconnect()]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
