import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  TransferEngine,
  createFtpProviderFactory,
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
const composeProject = "zero-transfer-ftp-integration";
const shouldRunDockerFtpIntegration =
  process.env.ZERO_TRANSFER_RUN_DOCKER_FTP === "1" ||
  process.env.npm_lifecycle_event === "test:integration:ftp";
const describeDockerFtp = shouldRunDockerFtpIntegration ? describe : describe.skip;

describeDockerFtp("FTP provider Docker integration", () => {
  beforeAll(async () => {
    await runDockerCompose(["down", "--volumes", "--remove-orphans"]);
    await runDockerCompose(["up", "-d", "ftp"]);
    await waitForDockerFtp();
  }, 120_000);

  afterAll(async () => {
    await runDockerCompose(["down", "--volumes", "--remove-orphans"]);
  }, 60_000);

  it("runs FTP metadata and transfer operations against pure-ftpd", async () => {
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect(createDockerFtpProfile());
    const copySession = await client.connect(createDockerFtpProfile());
    const transfers = requireTransfers(session);
    const content = "docker ftp integration\n";

    try {
      await transfers.write(
        createWriteRequest("/report.txt", createTextContent(content, 5), {
          totalBytes: Buffer.byteLength(content),
        }),
      );

      const stat = await session.fs.stat("/report.txt");
      const entries = await session.fs.list("/");
      const readResult = await transfers.read(createReadRequest("/report.txt"));
      const readTextResult = await readText(readResult.content);
      const rangedReadResult = await transfers.read(
        createReadRequest("/report.txt", { length: 3, offset: 7 }),
      );
      const rangeTextResult = await readText(rangedReadResult.content);
      const executor = createProviderTransferExecutor({
        resolveSession: ({ endpoint, role }) => {
          if (endpoint.provider !== "ftp") {
            return undefined;
          }

          return role === "source" ? session : copySession;
        },
      });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/copy.txt", provider: "ftp" },
          id: "docker-ftp-copy",
          operation: "copy",
          source: { path: "/report.txt", provider: "ftp" },
        },
        executor,
      );
      const copiedReadResult = await transfers.read(createReadRequest("/copy.txt"));
      const copiedTextResult = await readText(copiedReadResult.content);

      expect(stat).toMatchObject({
        path: "/report.txt",
        size: Buffer.byteLength(content),
        type: "file",
      });
      expect(entries.map((entry) => entry.path)).toContain("/report.txt");
      expect(readTextResult).toBe(content);
      expect(rangeTextResult).toBe(content.slice(7, 10));
      expect(receipt).toMatchObject({
        bytesTransferred: Buffer.byteLength(content),
        destination: { path: "/copy.txt", provider: "ftp" },
        source: { path: "/report.txt", provider: "ftp" },
      });
      expect(copiedTextResult).toBe(content);
    } finally {
      await session.disconnect();
      await copySession.disconnect();
    }
  }, 60_000);
});

async function runDockerCompose(args: string[]): Promise<void> {
  try {
    await execFileAsync("docker", ["compose", "-f", composeFile, "-p", composeProject, ...args], {
      cwd: process.cwd(),
      timeout: 120_000,
    });
  } catch (error) {
    throw new Error(
      `Docker compose command failed: docker compose ${args.join(" ")}\n${formatCommandError(error)}`,
      { cause: error },
    );
  }
}

async function waitForDockerFtp(): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const client = createTransferClient({ providers: [createFtpProviderFactory()] });
      const session = await client.connect({ ...createDockerFtpProfile(), timeoutMs: 1_000 });
      await session.disconnect();
      return;
    } catch (error) {
      lastError = error;
      await delay(1_000);
    }
  }

  throw new Error(`Docker FTP server did not become ready: ${formatCommandError(lastError)}`);
}

function createDockerFtpProfile(): ConnectionProfile {
  return {
    host: process.env.ZERO_TRANSFER_DOCKER_FTP_HOST ?? "127.0.0.1",
    password: process.env.ZERO_TRANSFER_DOCKER_FTP_PASSWORD ?? "zero-pass",
    port: Number(process.env.ZERO_TRANSFER_DOCKER_FTP_PORT ?? 2121),
    provider: "ftp",
    username: process.env.ZERO_TRANSFER_DOCKER_FTP_USERNAME ?? "zero",
  };
}

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) {
    throw new Error("Expected FTP transfer operations");
  }

  return session.transfers;
}

function createReadRequest(
  path: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path, provider: "ftp" },
    job: {
      id: "docker-ftp-read",
      operation: "download",
      source: { path, provider: "ftp" },
    },
    reportProgress: reportTestProgress,
    throwIfAborted: () => undefined,
  };

  if (range !== undefined) {
    request.range = range;
  }

  return request;
}

interface CreateWriteRequestOptions {
  totalBytes?: number;
}

function createWriteRequest(
  path: string,
  content: TransferDataSource,
  options: CreateWriteRequestOptions = {},
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    attempt: 1,
    content,
    endpoint: { path, provider: "ftp" },
    job: {
      destination: { path, provider: "ftp" },
      id: "docker-ftp-write",
      operation: "upload",
    },
    reportProgress: reportTestProgress,
    throwIfAborted: () => undefined,
  };

  if (options.totalBytes !== undefined) {
    request.totalBytes = options.totalBytes;
  }

  return request;
}

async function* createTextContent(
  text: string,
  chunkSize = text.length,
): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  const content = Buffer.from(text, "utf8");

  for (let offset = 0; offset < content.byteLength; offset += chunkSize) {
    yield content.subarray(offset, offset + chunkSize);
  }
}

async function readText(content: TransferDataSource): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of content) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function reportTestProgress(bytesTransferred: number, totalBytes?: number) {
  const input = {
    bytesTransferred,
    startedAt: new Date(0),
    transferId: "docker-ftp-provider-test",
  };

  return totalBytes === undefined
    ? createProgressEvent(input)
    : createProgressEvent({ ...input, totalBytes });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCommandError(error: unknown): string {
  if (error instanceof Error) {
    const commandError = error as Error & { stderr?: Buffer | string; stdout?: Buffer | string };
    const output = [commandError.stdout, commandError.stderr]
      .filter((value): value is Buffer | string => value !== undefined)
      .map((value) => value.toString().trim())
      .filter((value) => value.length > 0)
      .join("\n");

    return output.length > 0 ? `${error.message}\n${output}` : error.message;
  }

  return String(error);
}
