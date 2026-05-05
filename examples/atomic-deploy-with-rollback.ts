/**
 * @file Atomic blue/green-style deploy with rollback over SFTP.
 *
 * Stages the next release under `<liveRoot>/.releases/<releaseId>/`, swaps
 * the live symlink atomically, and prunes older releases beyond the retain
 * window. If activation fails the pre-computed backup path lets a caller
 * roll back to the previous release without any data loss. The plan itself
 * is fully deterministic and can be inspected before any I/O happens.
 *
 * Run with: tsx examples/atomic-deploy-with-rollback.ts
 */
import { mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  createAtomicDeployPlan,
  createLocalProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
  diffRemoteTrees,
  type AtomicDeployActivateStep,
  type ConnectionProfile,
} from "@zero-transfer/sftp";

async function listExistingReleases(remoteRoot: string): Promise<string[]> {
  // Real SFTP impl would call session.fs.list; this stub demonstrates the shape.
  try {
    const entries = await readdir(remoteRoot);
    return entries.map((name) => join(remoteRoot, name));
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createLocalProviderFactory({ rootPath: "./build" }), createSftpProviderFactory()],
  });

  const local: ConnectionProfile = { host: "local", provider: "local" };
  const remote: ConnectionProfile = {
    host: "deploy.example.com",
    password: { env: "DEPLOY_PASSWORD" },
    provider: "sftp",
    username: "deploy",
  };

  const localSession = await client.connect(local);
  const remoteSession = await client.connect(remote);
  try {
    // 1. Diff the local build directory against an empty staging dir to get the upload set.
    const diff = await diffRemoteTrees(
      localSession.fs,
      "/",
      remoteSession.fs,
      "/var/www/app/.releases/_pending",
    );

    // 2. Build the deterministic deploy plan.
    const releaseId = new Date().toISOString().replace(/[:.]/g, "-");
    const plan = createAtomicDeployPlan({
      destination: { provider: "sftp", rootPath: "/var/www/app" },
      diff,
      existingReleases: await listExistingReleases("/var/www/app/.releases"),
      id: `deploy:${releaseId}`,
      releaseId,
      retain: 5,
      source: { provider: "local", rootPath: "/" },
      strategy: "symlink",
    });

    console.log(`Plan ${plan.id}`);
    console.log(`  staging: ${plan.stagingPath}`);
    console.log(`  live:    ${plan.livePath}`);
    if (plan.backupPath !== undefined) console.log(`  backup:  ${plan.backupPath}`);
    console.log(`  upload steps: ${plan.uploadPlan.steps.length}`);
    console.log(`  prune steps:  ${plan.prune.length}`);

    // 3. Walk the activation steps. A real host would execute each step; we simulate.
    const executed: AtomicDeployActivateStep[] = [];
    try {
      for (const step of plan.activate) {
        console.log(`activate ${step.operation} ${step.fromPath ?? ""} -> ${step.toPath}`);
        // simulate: await applyStepOverSftp(remoteSession, step);
        executed.push(step);
      }
      console.log(`Released ${plan.releaseId} successfully.`);
    } catch (error) {
      console.error("Activation failed, rolling back...", error);
      // Reverse the executed activate steps using the backup path.
      for (const step of executed.reverse()) {
        if (step.operation === "rename" && plan.backupPath) {
          console.log(`rollback rename ${plan.backupPath} -> ${step.toPath}`);
        }
      }
      throw error;
    }

    // 4. Pre-create local mirror dirs so the next run sees the same shape.
    await mkdir("./build/.releases", { recursive: true });
  } finally {
    await Promise.allSettled([localSession.disconnect(), remoteSession.disconnect()]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main().catch((error: unknown) => {
    console.error("Deploy failed:", error);
    process.exit(1);
  });
}

export { main };
