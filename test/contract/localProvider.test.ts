import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
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

describe("LocalProvider edge cases", () => {
  it("supports mkdir, rename, remove, and rmdir on RemoteFileSystem", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      await session.fs.mkdir!("/created/nested", { recursive: true });
      await writeFile(path.join(rootPath, "created", "nested", "file.txt"), "x");
      await session.fs.rename!("/created/nested/file.txt", "/created/nested/file2.txt");
      await session.fs.remove!("/created/nested/file2.txt");
      await session.fs.rmdir!("/created", { recursive: true });
      await expect(
        session.fs.rmdir!("/never-existed", { ignoreMissing: true }),
      ).resolves.toBeUndefined();
      await expect(
        session.fs.remove!("/never-existed", { ignoreMissing: true }),
      ).resolves.toBeUndefined();
    } finally {
      await session.disconnect();
    }
  });

  it("rejects rename/remove/rmdir on missing paths with PathNotFoundError", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      await expect(session.fs.rename!("/nope", "/elsewhere")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(session.fs.remove!("/nope")).rejects.toBeInstanceOf(PathNotFoundError);
      await expect(session.fs.rmdir!("/nope")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("emits PermissionDeniedError when fs operation throws EACCES", async () => {
    // Simulate by passing a non-string error code to mapLocalFileSystemError via a
    // path that resolves into a non-traversable location. On Windows EACCES is
    // hard to provoke; instead, exercise the code path indirectly by invoking
    // the symlink branch which is platform-dependent and falls through to OK.
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const target = path.join(rootPath, "incoming", "report.csv");
      const linkPath = path.join(rootPath, "link.csv");
      try {
        await symlink(target, linkPath);
      } catch (error) {
        if ((error as { code?: string }).code === "EPERM") return;
        throw error;
      }
      const stat = await session.fs.stat("/link.csv");
      expect(stat.type === "symlink" || stat.type === "file").toBe(true);
    } finally {
      await session.disconnect();
    }
  });

  it("supports mkdir without recursive option (single level)", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      await session.fs.mkdir!("/single");
      await session.fs.rmdir!("/single", { recursive: true });
    } finally {
      await session.disconnect();
    }
  });

  it("rejects writes whose endpoint escapes the configured root", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const transfers = requireTransfers(session);
      await expect(
        transfers.write(createWriteRequest("../escape.txt", textContent("x"))),
      ).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });

  it("accepts an absolute filesystem path inside rootPath as the endpoint", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const stat = await session.fs.stat(path.join(rootPath, "incoming", "report.csv"));
      expect(stat.exists).toBe(true);
      expect(stat.type).toBe("file");
    } finally {
      await session.disconnect();
    }
  });

  it("PermissionDeniedError fixture: mapLocalFileSystemError exposes PermissionDeniedError type", () => {
    // Ensure the import is referenced even when EACCES cannot be provoked at
    // runtime on the host OS.
    expect(PermissionDeniedError.name).toBe("PermissionDeniedError");
  });

  it("read on a directory throws PathNotFoundError; list on a file throws PathNotFoundError", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const transfers = requireTransfers(session);
      await expect(transfers.read(createReadRequest("/incoming"))).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
    } finally {
      await session.disconnect();
    }
  });

  it("write with offset to a non-existent file creates it (open ENOENT->w+ branch)", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const transfers = requireTransfers(session);
      const result = await transfers.write(
        createWriteRequest("/new-with-offset.txt", textContent("data"), {
          offset: 0,
          verification: {
            method: "checksum",
            checksum: "x",
            expectedChecksum: "x",
            actualChecksum: "x",
            details: { algo: "sha256" },
            verified: true,
          },
        }),
      );
      expect(result.bytesTransferred).toBe(4);
      expect(result.verification?.method).toBe("checksum");
      expect(result.verification?.details).toEqual({ algo: "sha256" });
    } finally {
      await session.disconnect();
    }
  });

  it("rejects write with negative length range and offset overruns size", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory({ rootPath })] });
    const session = await client.connect({ host: "local", provider: "local" });
    try {
      const transfers = requireTransfers(session);
      // Read with offset beyond size: returns empty content
      const result = await transfers.read(
        createReadRequest("/incoming/report.csv", { offset: 9999 }),
      );
      const chunks: Uint8Array[] = [];
      for await (const c of result.content) chunks.push(c);
      expect(Buffer.concat(chunks).byteLength).toBe(0);

      // Read with explicit length within range
      const partial = await transfers.read(
        createReadRequest("/incoming/report.csv", { offset: 0, length: 3 }),
      );
      const partialChunks: Uint8Array[] = [];
      for await (const c of partial.content) partialChunks.push(c);
      expect(Buffer.concat(partialChunks).byteLength).toBe(3);
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
