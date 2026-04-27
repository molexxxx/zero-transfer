import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  TransferEngine,
  createProgressEvent,
  createLocalProviderFactory,
  createProviderTransferExecutor,
  createTransferClient,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferVerificationResult,
  type TransferSession,
} from "../../src/index";
import { describeProviderContract } from "./providerContract";

let rootPath: string;

beforeEach(async () => {
  rootPath = await mkdtemp(path.join(os.tmpdir(), "zero-transfer-local-provider-"));
  await mkdir(path.join(rootPath, "incoming"));
  await writeFile(path.join(rootPath, "incoming", "report.csv"), "id,name\n1,Ada\n", "utf8");
  await writeFile(path.join(rootPath, "root-note.txt"), "note", "utf8");
});

afterEach(async () => {
  await rm(rootPath, { force: true, recursive: true });
});

describeProviderContract("local", {
  createProviderFactory: () => createLocalProviderFactory({ rootPath }),
  expectedCapabilities: {
    authentication: ["anonymous"],
    list: true,
    provider: "local",
    stat: true,
  },
  expectedListPaths: ["/incoming/report.csv"],
  expectedStat: {
    name: "report.csv",
    path: "/incoming/report.csv",
    size: 14,
    type: "file",
  },
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile: { host: "local", provider: "local" },
  statPath: "/incoming/report.csv",
});

describe("createLocalProviderFactory", () => {
  it("can use profile.host as the local root path", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory()] });
    const session = await client.connect({ host: rootPath, provider: "local" });

    try {
      await expect(session.fs.list("/")).resolves.toEqual([
        expect.objectContaining({ path: "/incoming", type: "directory" }),
        expect.objectContaining({ path: "/root-note.txt", type: "file" }),
      ]);
      const stat = await session.fs.stat("incoming/report.csv");

      expect(stat.exists).toBe(true);
      expect(typeof stat.permissions?.raw).toBe("string");
      expect(typeof stat.uniqueId).toBe("string");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed errors for missing paths and root escapes", async () => {
    const client = createTransferClient({
      providers: [createLocalProviderFactory({ rootPath })],
    });
    const session = await client.connect({ host: "local", provider: "local" });

    try {
      await expect(session.fs.stat("/missing.txt")).rejects.toBeInstanceOf(PathNotFoundError);
      await expect(session.fs.list("/incoming/report.csv")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(session.fs.stat("../outside.txt")).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });

  it("reads, writes, and copies local transfer content", async () => {
    const client = createTransferClient({
      providers: [createLocalProviderFactory({ rootPath })],
    });
    const session = await client.connect({ host: "local", provider: "local" });

    try {
      const transfers = requireTransfers(session);
      const rangeRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { length: 4, offset: 3 }),
      );

      expect(rangeRead).toMatchObject({ bytesRead: 3, totalBytes: 4 });
      await expect(readText(rangeRead.content)).resolves.toBe("name");

      const writeResult = await transfers.write(
        createWriteRequest("/out/result.txt", textContent("hello")),
      );

      expect(writeResult).toMatchObject({ bytesTransferred: 5, totalBytes: 5 });
      await expect(readFile(path.join(rootPath, "out", "result.txt"), "utf8")).resolves.toBe(
        "hello",
      );

      const executor = createProviderTransferExecutor({ resolveSession: () => session });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/out/copy.csv", provider: "local" },
          id: "local-copy",
          operation: "copy",
          source: { path: "/incoming/report.csv", provider: "local" },
        },
        executor,
      );

      expect(receipt).toMatchObject({ bytesTransferred: 14, totalBytes: 14 });
      await expect(readFile(path.join(rootPath, "out", "copy.csv"), "utf8")).resolves.toBe(
        "id,name\n1,Ada\n",
      );
    } finally {
      await session.disconnect();
    }
  });

  it("handles local transfer ranges, resumed writes, verification, and errors", async () => {
    const verification: TransferVerificationResult = {
      actualChecksum: "local123",
      details: { algorithm: "fixture" },
      expectedChecksum: "local123",
      method: "checksum",
      verified: true,
    };
    const client = createTransferClient({
      providers: [createLocalProviderFactory({ rootPath })],
    });
    const session = await client.connect({ host: "local", provider: "local" });

    try {
      const transfers = requireTransfers(session);
      const offsetRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { offset: 3 }),
      );
      const emptyRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { length: 5, offset: 99 }),
      );

      expect(offsetRead).toMatchObject({ bytesRead: 3, totalBytes: 11 });
      await expect(readText(offsetRead.content)).resolves.toBe("name\n1,Ada\n");
      expect(emptyRead).toMatchObject({ bytesRead: 14, totalBytes: 0 });
      await expect(readText(emptyRead.content)).resolves.toBe("");

      await transfers.write(createWriteRequest("/out/existing.txt", textContent("abcdef")));
      const resumed = await transfers.write(
        createWriteRequest("/out/existing.txt", textContent("XY"), { offset: 2, verification }),
      );

      expect(resumed).toMatchObject({
        bytesTransferred: 2,
        resumed: true,
        totalBytes: 6,
        verification,
        verified: true,
      });
      expect(resumed.verification).not.toBe(verification);
      expect(resumed.verification?.details).not.toBe(verification.details);
      await expect(readFile(path.join(rootPath, "out", "existing.txt"), "utf8")).resolves.toBe(
        "abXYef",
      );

      await transfers.write(createWriteRequest("/out/sparse.txt", textContent("z"), { offset: 3 }));
      const sparse = await readFile(path.join(rootPath, "out", "sparse.txt"));
      expect([...sparse]).toEqual([0, 0, 0, 122]);

      await expect(transfers.read(createReadRequest("/incoming"))).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(
        transfers.write(
          createWriteRequest("/out/invalid-offset.txt", textContent("x"), {
            offset: -1,
          }),
        ),
      ).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });
});

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) {
    throw new Error("Expected local provider transfer operations");
  }

  return session.transfers;
}

function createReadRequest(
  remotePath: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path: remotePath, provider: "local" },
    job: { id: "local-direct-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      createTestProgressEvent("local-direct-read", bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };

  if (range !== undefined) {
    request.range = range;
  }

  return request;
}

function createWriteRequest(
  remotePath: string,
  content: TransferDataSource,
  options: TestWriteOptions = {},
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    attempt: 1,
    content,
    endpoint: { path: remotePath, provider: "local" },
    job: { id: "local-direct-write", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      createTestProgressEvent("local-direct-write", bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };

  if (options.offset !== undefined) {
    request.offset = options.offset;
  }

  if (options.totalBytes !== undefined) {
    request.totalBytes = options.totalBytes;
  }

  if (options.verification !== undefined) {
    request.verification = options.verification;
  }

  return request;
}

interface TestWriteOptions {
  offset?: number;
  totalBytes?: number;
  verification?: TransferVerificationResult;
}

function createTestProgressEvent(
  transferId: string,
  bytesTransferred: number,
  totalBytes: number | undefined,
) {
  const input = {
    bytesTransferred,
    now: new Date(0),
    startedAt: new Date(0),
    transferId,
  };

  return totalBytes === undefined
    ? createProgressEvent(input)
    : createProgressEvent({ ...input, totalBytes });
}

async function* textContent(value: string): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  yield Buffer.from(value, "utf8");
}

async function readText(content: TransferDataSource): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of content) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
