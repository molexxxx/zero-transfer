/**
 * @file WebDAV bidirectional sync example.
 *
 * Walks a remote WebDAV directory, diffs it against a local checkout,
 * and produces a `TransferPlan` via `createSyncPlan`. Then executes
 * the plan with the friendly helpers when not running in dry-run mode.
 */
import {
  createLocalProviderFactory,
  createSyncPlan,
  createTransferClient,
  createWebDavProviderFactory,
  diffRemoteTrees,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/webdav";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [
      createLocalProviderFactory({ rootPath: "./public" }),
      createWebDavProviderFactory({ secure: true }),
    ],
  });

  const local: ConnectionProfile = { host: "local", provider: "local" };
  const remote: ConnectionProfile = {
    host: "dav.example.com",
    password: { env: "DAV_PASSWORD" },
    provider: "webdav",
    username: "deployer",
  };

  const localSession = await client.connect(local);
  const remoteSession = await client.connect(remote);
  try {
    const diff = await diffRemoteTrees(localSession.fs, "/", remoteSession.fs, "/site");
    const plan = createSyncPlan({
      conflictPolicy: "overwrite",
      deletePolicy: "mirror",
      destination: { provider: "webdav", rootPath: "/site" },
      diff,
      dryRun: false,
      id: "site-sync",
      source: { provider: "local", rootPath: "/" },
    });

    console.log(`Plan ${plan.id}: ${plan.steps.length} step(s)`);
    for (const step of plan.steps) {
      if (step.action === "upload" && step.source && step.destination) {
        await uploadFile({
          client,
          destination: { path: step.destination.path, profile: remote },
          localPath: `./public${step.source.path}`,
        });
      }
    }
  } finally {
    await Promise.allSettled([localSession.disconnect(), remoteSession.disconnect()]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
