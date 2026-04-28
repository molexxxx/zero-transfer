/**
 * @file Multi-cloud orchestration showcase.
 *
 * A single TransferClient juggles classic SFTP, AWS S3 (with multipart resume),
 * Azure Blob, and a local staging directory — all behind one provider-neutral
 * API. Demonstrates: parallel uploads via the queue, deterministic dry-run
 * planning, audit logging that fans out to a webhook, structured logging,
 * graceful shutdown, and OAuth-style token refresh for the Azure side.
 *
 * Run with: tsx examples/multi-cloud-orchestration.ts
 */
import { setTimeout as wait } from "node:timers/promises";
import {
  createAzureBlobProviderFactory,
  createLocalProviderFactory,
  createMemoryS3MultipartResumeStore,
  createOAuthTokenSecretSource,
  createProviderTransferExecutor,
  createS3ProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
  createWebhookAuditLog,
  freezeReceipt,
  TransferQueue,
  type ConnectionProfile,
  type MftAuditEntry,
  type ProviderTransferSessionResolverInput,
  type TransferJob,
  type TransferSession,
  type ZeroTransferLogger,
} from "../src/index";

const logger: ZeroTransferLogger = {
  debug: (record) => console.debug(`[debug] ${record.message}`),
  error: (record) => console.error(`[error] ${record.message}`, record.error),
  info: (record) => console.log(`[info] ${record.message}`),
  warn: (record) => console.warn(`[warn] ${record.message}`),
};

async function main(): Promise<void> {
  // -- 1. Build a single client that speaks SFTP, S3, Azure Blob, and the local FS.
  const azureToken = createOAuthTokenSecretSource(
    () => ({
      accessToken: process.env["AZURE_AAD_TOKEN"] ?? "demo-token",
      expiresAt: new Date(Date.now() + 55 * 60 * 1000),
    }),
    { skewMs: 60_000 },
  );

  const client = createTransferClient({
    logger,
    providers: [
      createSftpProviderFactory(),
      createS3ProviderFactory({
        multipart: {
          enabled: true,
          partSizeBytes: 16 * 1024 * 1024,
          resumeStore: createMemoryS3MultipartResumeStore(),
          thresholdBytes: 32 * 1024 * 1024,
        },
        region: "us-east-1",
      }),
      createAzureBlobProviderFactory({ account: "molexanalytics", container: "archive" }),
      createLocalProviderFactory({ rootPath: "./staging" }),
    ],
  });

  // -- 2. Profiles for each side. Real apps load these from a vault / env.
  const sftp: ConnectionProfile = {
    host: "sftp.partner.example.com",
    password: { env: "PARTNER_PASSWORD" },
    provider: "sftp",
    username: "molex",
  };
  const s3: ConnectionProfile = {
    host: "data-lake-bronze",
    password: { env: "AWS_SECRET_ACCESS_KEY" },
    provider: "s3",
    username: { env: "AWS_ACCESS_KEY_ID" },
  };
  const azure: ConnectionProfile = {
    host: "molexanalytics.blob.core.windows.net/archive",
    password: azureToken,
    provider: "azure-blob",
  };
  const local: ConnectionProfile = { host: "local", provider: "local" };

  // -- 3. Open every session up front so the queue can resolve providers fast.
  const sessions = await Promise.all([
    client.connect(sftp),
    client.connect(s3),
    client.connect(azure),
    client.connect(local),
  ]);
  const [sftpSession, s3Session, azureSession, localSession] = sessions;
  if (
    sftpSession === undefined ||
    s3Session === undefined ||
    azureSession === undefined ||
    localSession === undefined
  ) {
    throw new Error("Failed to open all sessions");
  }
  const sessionByProvider = new Map<string, TransferSession>([
    ["sftp", sftpSession],
    ["s3", s3Session],
    ["azure-blob", azureSession],
    ["local", localSession],
  ]);

  const resolveSession = ({ endpoint }: ProviderTransferSessionResolverInput): TransferSession => {
    const provider = endpoint.provider ?? "local";
    const session = sessionByProvider.get(provider);
    if (!session) throw new Error(`No session for provider ${provider}`);
    return session;
  };
  const executor = createProviderTransferExecutor({ resolveSession });

  // -- 4. Webhook audit fan-out — receipts and errors go to the ops channel.
  const audit = createWebhookAuditLog({
    onDelivery: ({ entry, result }) =>
      logger.info?.({
        destination: "audit",
        level: "info",
        message: `Webhook ${entry.type} delivered=${result.delivered} status=${result.status}`,
      }),
    target: {
      headers: { "x-source": "molex-mft" },
      secret: process.env["WEBHOOK_SECRET"] ?? "demo-secret",
      types: ["result", "error"],
      url: "https://hooks.example.com/mft",
    },
  });

  const recordAudit = (entry: MftAuditEntry): void => {
    void audit.record(entry);
  };

  // -- 5. Build a batch of cross-provider transfers and run them concurrently.
  const queue = new TransferQueue({
    concurrency: 3,
    executor,
    onError: (item, error) => {
      const message = error instanceof Error ? error.message : String(error);
      recordAudit({
        error: { message },
        id: `audit-error-${item.id}`,
        recordedAt: new Date(),
        routeId: item.id,
        type: "error",
      });
    },
    onProgress: (event) =>
      logger.debug?.({
        destination: "transfer",
        level: "debug",
        message: `${event.transferId} ${event.bytesTransferred}/${event.totalBytes ?? "?"}`,
      }),
    onReceipt: (receipt) => {
      recordAudit({
        id: `audit-result-${receipt.jobId}`,
        receipt: freezeReceipt(receipt),
        recordedAt: new Date(),
        routeId: receipt.jobId,
        type: "result",
      });
    },
  });

  const jobs: TransferJob[] = [
    {
      destination: { path: "/lake/bronze/payroll-2026-04-28.csv", provider: "s3" },
      id: "ingest:partner-payroll",
      operation: "copy",
      source: { path: "/outbox/payroll-2026-04-28.csv", provider: "sftp" },
    },
    {
      destination: { path: "/archive/payroll-2026-04-28.csv", provider: "azure-blob" },
      id: "archive:partner-payroll",
      operation: "copy",
      source: { path: "/outbox/payroll-2026-04-28.csv", provider: "sftp" },
    },
    {
      destination: { path: "/cache/payroll-2026-04-28.csv", provider: "local" },
      id: "stage:partner-payroll",
      operation: "download",
      source: { path: "/outbox/payroll-2026-04-28.csv", provider: "sftp" },
    },
  ];
  for (const job of jobs) queue.add(job);

  const summary = await queue.run();
  logger.info?.({
    destination: "queue",
    level: "info",
    message: `Drained ${summary.completed}/${summary.total} (failed=${summary.failed})`,
  });

  // -- 6. Shut the world down cleanly even if some sessions errored.
  await wait(50);
  await Promise.allSettled(sessions.map((session) => session.disconnect()));
}

void main().catch((error: unknown) => {
  console.error("Fatal:", error);
  process.exit(1);
});
