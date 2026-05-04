import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createProgressEvent,
  createTransferClient,
  createWebDavProviderFactory,
  type ConnectionProfile,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferSession,
} from "../../src/index";

const execFileAsync = promisify(execFile);
const composeFile = path.join(process.cwd(), "test", "servers", "docker-compose.yml");
const composeProject = "zero-transfer-webdav-integration";
const shouldRun =
  process.env.ZERO_TRANSFER_RUN_DOCKER_WEBDAV === "1" ||
  process.env.npm_lifecycle_event === "test:integration:webdav";
const describeDocker = shouldRun ? describe : describe.skip;

const HOST = process.env.ZERO_TRANSFER_DOCKER_WEBDAV_HOST ?? "127.0.0.1";
const PORT = Number(process.env.ZERO_TRANSFER_DOCKER_WEBDAV_PORT ?? 8081);
const USERNAME = process.env.ZERO_TRANSFER_DOCKER_WEBDAV_USERNAME ?? "zero";
const PASSWORD = process.env.ZERO_TRANSFER_DOCKER_WEBDAV_PASSWORD ?? "zero-pass";

describeDocker("WebDAV provider Docker integration", () => {
  beforeAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
    await runDockerCompose(["--profile", "integration", "up", "-d", "webdav"]);
    await waitForReady();
  }, 240_000);

  afterAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
  }, 60_000);

  it("performs PUT/PROPFIND/GET against bytemark/webdav (buffered)", async () => {
    const client = createTransferClient({
      providers: [createWebDavProviderFactory({ uploadStreaming: "never" })],
    });
    const session = await client.connect(makeProfile());
    const transfers = requireTransfers(session);
    const content = "docker webdav integration\n";

    try {
      await transfers.write(
        makeWriteRequest("/buffered.txt", textContent(content), {
          totalBytes: Buffer.byteLength(content),
        }),
      );

      const stat = await session.fs.stat("/buffered.txt");
      const list = await session.fs.list("/");
      const readResult = await transfers.read(makeReadRequest("/buffered.txt"));
      const text = await readText(readResult.content);

      expect(stat.size).toBe(Buffer.byteLength(content));
      expect(list.map((entry) => entry.path)).toContain("/buffered.txt");
      expect(text).toBe(content);
    } finally {
      await session.disconnect();
    }
  }, 120_000);

  it("performs streaming PUT when totalBytes is known (uploadStreaming: when-known-size)", async () => {
    const client = createTransferClient({
      providers: [createWebDavProviderFactory({ uploadStreaming: "when-known-size" })],
    });
    const session = await client.connect(makeProfile());
    const transfers = requireTransfers(session);
    const content = "docker webdav streamed\n";

    try {
      await transfers.write(
        makeWriteRequest("/streamed.txt", textContent(content), {
          totalBytes: Buffer.byteLength(content),
        }),
      );
      const result = await transfers.read(makeReadRequest("/streamed.txt"));
      const text = await readText(result.content);
      expect(text).toBe(content);
    } finally {
      await session.disconnect();
    }
  }, 120_000);
});

async function runDockerCompose(args: string[]): Promise<void> {
  try {
    await execFileAsync("docker", ["compose", "-f", composeFile, "-p", composeProject, ...args], {
      cwd: process.cwd(),
      timeout: 240_000,
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
      const client = createTransferClient({ providers: [createWebDavProviderFactory()] });
      const session = await client.connect({ ...makeProfile(), timeoutMs: 2_000 });
      await session.fs.list("/").catch(() => undefined);
      await session.disconnect();
      return;
    } catch (error) {
      lastError = error;
      await delay(2_000);
    }
  }
  throw new Error(`Docker WebDAV server did not become ready: ${formatErr(lastError)}`);
}

function makeProfile(): ConnectionProfile {
  return {
    host: HOST,
    password: PASSWORD,
    port: PORT,
    protocol: "ftp",
    provider: "webdav",
    username: USERNAME,
  };
}

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) throw new Error("Expected WebDAV transfers");
  return session.transfers;
}

function makeReadRequest(
  p: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path: p, provider: "webdav" },
    job: {
      id: "docker-webdav-read",
      operation: "download",
      source: { path: p, provider: "webdav" },
    },
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
    endpoint: { path: p, provider: "webdav" },
    job: {
      destination: { path: p, provider: "webdav" },
      id: "docker-webdav-write",
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
  const input = { bytesTransferred, startedAt: new Date(0), transferId: "docker-webdav-test" };
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
