import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  TransferEngine,
  createNativeSftpProviderFactory,
  createProgressEvent,
  createProviderTransferExecutor,
  createTransferClient,
  type ConnectionProfile,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferSession,
} from "../../src/index";

const execFileAsync = promisify(execFile);
const composeFile = path.join(process.cwd(), "test", "servers", "docker-compose.yml");
const composeProject = "zero-transfer-sftp-integration";
const shouldRun =
  process.env.ZERO_TRANSFER_RUN_DOCKER_SFTP === "1" ||
  process.env.npm_lifecycle_event === "test:integration:sftp";
const describeDocker = shouldRun ? describe : describe.skip;

describeDocker("SFTP provider Docker integration", () => {
  beforeAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
    await runDockerCompose(["--profile", "integration", "up", "-d", "sftp"]);
    await waitForReady();
  }, 180_000);

  afterAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
  }, 60_000);

  it("performs SFTP metadata + transfer operations against atmoz/sftp", async () => {
    const client = createTransferClient({ providers: [createNativeSftpProviderFactory()] });
    const session = await client.connect(makeProfile());
    const copySession = await client.connect(makeProfile());
    const transfers = requireTransfers(session);
    const content = "docker sftp integration\n";

    try {
      await transfers.write(
        makeWriteRequest("/upload/report.txt", textContent(content), {
          totalBytes: Buffer.byteLength(content),
        }),
      );

      const stat = await session.fs.stat("/upload/report.txt");
      const entries = await session.fs.list("/upload");
      const readResult = await transfers.read(makeReadRequest("/upload/report.txt"));
      const readText1 = await readText(readResult.content);
      const ranged = await transfers.read(
        makeReadRequest("/upload/report.txt", { length: 3, offset: 7 }),
      );
      const rangeText = await readText(ranged.content);
      const executor = createProviderTransferExecutor({
        resolveSession: ({ endpoint, role }) => {
          if (endpoint.provider !== "sftp") return undefined;
          return role === "source" ? session : copySession;
        },
      });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/upload/copy.txt", provider: "sftp" },
          id: "docker-sftp-copy",
          operation: "copy",
          source: { path: "/upload/report.txt", provider: "sftp" },
        },
        executor,
      );
      const copied = await transfers.read(makeReadRequest("/upload/copy.txt"));
      const copiedText = await readText(copied.content);

      expect(stat).toMatchObject({
        path: "/upload/report.txt",
        size: Buffer.byteLength(content),
        type: "file",
      });
      expect(entries.map((e) => e.path)).toContain("/upload/report.txt");
      expect(readText1).toBe(content);
      expect(rangeText).toBe(content.slice(7, 10));
      expect(receipt).toMatchObject({
        bytesTransferred: Buffer.byteLength(content),
      });
      expect(copiedText).toBe(content);
    } finally {
      await session.disconnect();
      await copySession.disconnect();
    }
  }, 120_000);
});

async function runDockerCompose(args: string[]): Promise<void> {
  try {
    await execFileAsync("docker", ["compose", "-f", composeFile, "-p", composeProject, ...args], {
      cwd: process.cwd(),
      timeout: 180_000,
    });
  } catch (error) {
    throw new Error(`docker compose ${args.join(" ")} failed: ${formatErr(error)}`, {
      cause: error,
    });
  }
}

async function waitForReady(): Promise<void> {
  const deadline = Date.now() + 90_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const client = createTransferClient({ providers: [createNativeSftpProviderFactory()] });
      const session = await client.connect({ ...makeProfile(), timeoutMs: 2_000 });
      await session.disconnect();
      return;
    } catch (error) {
      lastError = error;
      await delay(2_000);
    }
  }
  throw new Error(`Docker SFTP server did not become ready: ${formatErr(lastError)}`);
}

function makeProfile(): ConnectionProfile {
  return {
    host: process.env.ZERO_TRANSFER_DOCKER_SFTP_HOST ?? "127.0.0.1",
    password: process.env.ZERO_TRANSFER_DOCKER_SFTP_PASSWORD ?? "zero-pass",
    port: Number(process.env.ZERO_TRANSFER_DOCKER_SFTP_PORT ?? 2222),
    provider: "sftp",
    username: process.env.ZERO_TRANSFER_DOCKER_SFTP_USERNAME ?? "zero",
  };
}

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) throw new Error("Expected SFTP transfers");
  return session.transfers;
}

function makeReadRequest(
  p: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path: p, provider: "sftp" },
    job: { id: "docker-sftp-read", operation: "download", source: { path: p, provider: "sftp" } },
    reportProgress: report,
    throwIfAborted: () => undefined,
  };
  if (range !== undefined) request.range = range;
  return request;
}

function makeWriteRequest(
  p: string,
  content: TransferDataSource,
  options: { totalBytes?: number } = {},
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    attempt: 1,
    content,
    endpoint: { path: p, provider: "sftp" },
    job: {
      destination: { path: p, provider: "sftp" },
      id: "docker-sftp-write",
      operation: "upload",
    },
    reportProgress: report,
    throwIfAborted: () => undefined,
  };
  if (options.totalBytes !== undefined) request.totalBytes = options.totalBytes;
  return request;
}

async function* textContent(text: string): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  yield Buffer.from(text, "utf8");
}

async function readText(content: TransferDataSource): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of content) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function report(bytesTransferred: number, totalBytes?: number) {
  const input = { bytesTransferred, startedAt: new Date(0), transferId: "docker-sftp-test" };
  return totalBytes === undefined
    ? createProgressEvent(input)
    : createProgressEvent({ ...input, totalBytes });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatErr(error: unknown): string {
  if (error instanceof Error) {
    const e = error as Error & { stderr?: Buffer | string; stdout?: Buffer | string };
    const out = [e.stdout, e.stderr]
      .filter((v): v is Buffer | string => v !== undefined)
      .map((v) => v.toString().trim())
      .filter((v) => v.length > 0)
      .join("\n");
    return out.length > 0 ? `${error.message}\n${out}` : error.message;
  }
  return String(error);
}
