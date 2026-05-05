import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createProgressEvent,
  createS3ProviderFactory,
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
const composeProject = "zero-transfer-s3-integration";
const shouldRun =
  process.env.ZERO_TRANSFER_RUN_DOCKER_S3 === "1" ||
  process.env.npm_lifecycle_event === "test:integration:s3";
const describeDocker = shouldRun ? describe : describe.skip;

const ENDPOINT = process.env.ZERO_TRANSFER_DOCKER_S3_ENDPOINT ?? "http://127.0.0.1:9000";
const REGION = process.env.ZERO_TRANSFER_DOCKER_S3_REGION ?? "us-east-1";
const BUCKET = process.env.ZERO_TRANSFER_DOCKER_S3_BUCKET ?? "zero-transfer-test";
const ACCESS_KEY = process.env.ZERO_TRANSFER_DOCKER_S3_ACCESS_KEY ?? "zero";
const SECRET_KEY = process.env.ZERO_TRANSFER_DOCKER_S3_SECRET_KEY ?? "zero-pass-1234";

describeDocker("S3 provider Docker integration (MinIO)", () => {
  beforeAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
    // Bring up MinIO and the sidecar that provisions the test bucket.
    await runDockerCompose(["--profile", "integration", "up", "-d", "minio", "minio-init"]);
    await waitForReady();
    await waitForBucket();
  }, 240_000);

  afterAll(async () => {
    await runDockerCompose(["--profile", "integration", "down", "--volumes", "--remove-orphans"]);
  }, 60_000);

  it("performs single-shot PUT/GET via the S3 provider", async () => {
    const client = createTransferClient({
      providers: [
        createS3ProviderFactory({
          endpoint: ENDPOINT,
          pathStyle: true,
          region: REGION,
        }),
      ],
    });
    const session = await client.connect(makeProfile());
    const transfers = requireTransfers(session);
    const content = "docker s3 integration\n";

    try {
      await transfers.write(
        makeWriteRequest("/single-shot.txt", textContent(content), {
          totalBytes: Buffer.byteLength(content),
        }),
      );

      const stat = await session.fs.stat("/single-shot.txt");
      const list = await session.fs.list("/");
      const result = await transfers.read(makeReadRequest("/single-shot.txt"));
      const text = await readText(result.content);
      const ranged = await transfers.read(
        makeReadRequest("/single-shot.txt", { length: 3, offset: 7 }),
      );
      const rangeText = await readText(ranged.content);

      expect(stat.size).toBe(Buffer.byteLength(content));
      expect(list.map((entry) => entry.path)).toContain("/single-shot.txt");
      expect(text).toBe(content);
      expect(rangeText).toBe(content.slice(7, 10));
    } finally {
      await session.disconnect();
    }
  }, 120_000);

  it("performs multipart upload for payloads above the threshold", async () => {
    // 12 MiB payload split across two 8 MiB-and-4 MiB parts (default partSize=8 MiB,
    // threshold=8 MiB). The S3 provider buffers up to threshold then begins
    // multipart upload - this exercises CreateMultipartUpload, UploadPart,
    // and CompleteMultipartUpload against MinIO.
    const partSize = 5 * 1024 * 1024; // 5 MiB (S3 minimum part size)
    const totalBytes = partSize * 2 + 1024;
    const client = createTransferClient({
      providers: [
        createS3ProviderFactory({
          endpoint: ENDPOINT,
          multipart: { enabled: true, partSizeBytes: partSize, thresholdBytes: partSize },
          pathStyle: true,
          region: REGION,
        }),
      ],
    });
    const session = await client.connect(makeProfile());
    const transfers = requireTransfers(session);

    try {
      await transfers.write(
        makeWriteRequest("/multipart.bin", randomBytes(totalBytes, 1024 * 1024), {
          totalBytes,
        }),
      );

      const stat = await session.fs.stat("/multipart.bin");
      expect(stat.size).toBe(totalBytes);

      const result = await transfers.read(makeReadRequest("/multipart.bin"));
      let received = 0;
      for await (const chunk of result.content) received += chunk.byteLength;
      expect(received).toBe(totalBytes);
    } finally {
      await session.disconnect();
    }
  }, 240_000);
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
  const url = `${ENDPOINT.replace(/\/$/, "")}/minio/health/ready`;
  const deadline = Date.now() + 120_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`status ${String(response.status)}`);
    } catch (error) {
      lastError = error;
    }
    await delay(2_000);
  }
  throw new Error(`MinIO did not become ready: ${formatErr(lastError)}`);
}

async function waitForBucket(): Promise<void> {
  // The minio-init sidecar creates the bucket; we poll a HEAD request to
  // confirm it is reachable through the S3 provider before the tests run.
  const factory = createS3ProviderFactory({ endpoint: ENDPOINT, pathStyle: true, region: REGION });
  const deadline = Date.now() + 60_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    const session = await factory.create().connect(makeProfile());
    try {
      await session.fs.list("/");
      return;
    } catch (error) {
      lastError = error;
    } finally {
      await session.disconnect();
    }
    await delay(2_000);
  }
  throw new Error(`MinIO bucket did not become ready: ${formatErr(lastError)}`);
}

function makeProfile(): ConnectionProfile {
  return {
    host: BUCKET,
    password: SECRET_KEY,
    protocol: "ftp",
    provider: "s3",
    username: ACCESS_KEY,
  };
}

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) throw new Error("Expected S3 transfers");
  return session.transfers;
}

function makeReadRequest(
  p: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path: p, provider: "s3" },
    job: { id: "docker-s3-read", operation: "download", source: { path: p, provider: "s3" } },
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
    endpoint: { path: p, provider: "s3" },
    job: { destination: { path: p, provider: "s3" }, id: "docker-s3-write", operation: "upload" },
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

async function* randomBytes(total: number, chunkSize: number): AsyncGenerator<Uint8Array> {
  let remaining = total;
  let seed = 1;
  while (remaining > 0) {
    const size = Math.min(chunkSize, remaining);
    const chunk = Buffer.alloc(size);
    for (let i = 0; i < size; i += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      chunk[i] = seed & 0xff;
    }
    remaining -= size;
    yield chunk;
    await Promise.resolve();
  }
}

async function readText(content: TransferDataSource): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of content) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function report(bytesTransferred: number, totalBytes?: number) {
  const input = { bytesTransferred, startedAt: new Date(0), transferId: "docker-s3-test" };
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
