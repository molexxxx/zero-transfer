import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  TransferEngine,
  createProgressEvent,
  createMemoryProviderFactory,
  createProviderTransferExecutor,
  createTransferClient,
  type MemoryProviderEntry,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferVerificationResult,
  type TransferSession,
} from "../../src/index";
import { describeProviderContract } from "./providerContract";

const reportModifiedAt = new Date("2026-04-27T12:00:00.000Z");

const fixtureEntries = [
  {
    path: "/incoming",
    type: "directory",
    modifiedAt: new Date("2026-04-27T11:00:00.000Z"),
    uniqueId: "dir:incoming",
  },
  {
    path: "/incoming/report.csv",
    type: "file",
    size: 24,
    modifiedAt: reportModifiedAt,
    createdAt: new Date("2026-04-27T10:00:00.000Z"),
    accessedAt: new Date("2026-04-27T12:30:00.000Z"),
    permissions: { group: "r", other: "", raw: "rw-r-----", user: "rw" },
    owner: "tester",
    group: "qa",
    uniqueId: "file:report",
    raw: { fixture: true },
  },
  {
    path: "/incoming/report-link.csv",
    type: "symlink",
    symlinkTarget: "/incoming/report.csv",
    uniqueId: "link:report",
  },
  {
    path: "relative-note.txt",
    type: "file",
    size: 4,
  },
] satisfies MemoryProviderEntry[];

describeProviderContract("memory", {
  createProviderFactory: () => createMemoryProviderFactory({ entries: fixtureEntries }),
  expectedListPaths: ["/incoming/report-link.csv", "/incoming/report.csv"],
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile: { host: "memory.local", provider: "memory" },
  statPath: "/incoming/report.csv",
});

describe("createMemoryProviderFactory", () => {
  it("can expose an empty memory provider", async () => {
    const client = createTransferClient({ providers: [createMemoryProviderFactory()] });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      await expect(session.fs.list("/")).resolves.toEqual([]);
    } finally {
      await session.disconnect();
    }
  });

  it("connects through an explicitly registered memory provider", async () => {
    const provider = createMemoryProviderFactory({ entries: fixtureEntries });
    const client = createTransferClient({ providers: [provider] });

    expect(client.hasProvider("memory")).toBe(true);
    expect(client.getCapabilities("memory")).toEqual(provider.capabilities);

    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      expect(session.capabilities).toMatchObject({
        authentication: ["anonymous"],
        list: true,
        provider: "memory",
        stat: true,
      });
      await expect(session.fs.list("/")).resolves.toEqual([
        expect.objectContaining({ path: "/incoming", type: "directory" }),
        expect.objectContaining({ path: "/relative-note.txt", type: "file" }),
      ]);
    } finally {
      await session.disconnect();
    }
  });

  it("normalizes fixture paths and returns cloned metadata", async () => {
    const client = createTransferClient({
      providers: [createMemoryProviderFactory({ entries: fixtureEntries })],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      const stat = await session.fs.stat("incoming/report.csv");

      expect(stat).toMatchObject({
        exists: true,
        group: "qa",
        owner: "tester",
        path: "/incoming/report.csv",
        permissions: { raw: "rw-r-----" },
        size: 24,
        type: "file",
        uniqueId: "file:report",
      });
      expect(stat.modifiedAt).toEqual(reportModifiedAt);
      expect(stat.modifiedAt).not.toBe(reportModifiedAt);

      stat.modifiedAt?.setUTCFullYear(2000);
      stat.permissions = { raw: "mutated" };

      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        modifiedAt: reportModifiedAt,
        permissions: { raw: "rw-r-----" },
      });
      await expect(session.fs.stat("relative-note.txt")).resolves.toMatchObject({
        path: "/relative-note.txt",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed errors for missing paths and non-directory lists", async () => {
    const client = createTransferClient({
      providers: [createMemoryProviderFactory({ entries: fixtureEntries })],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      await expect(session.fs.stat("/missing.txt")).rejects.toBeInstanceOf(PathNotFoundError);
      await expect(session.fs.list("/incoming/report.csv")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
    } finally {
      await session.disconnect();
    }
  });

  it("rejects invalid fixture trees with typed configuration errors", () => {
    expect(() => createMemoryProviderFactory({ entries: [{ path: "/", type: "file" }] })).toThrow(
      ConfigurationError,
    );
    expect(() =>
      createMemoryProviderFactory({
        entries: [
          { path: "/blocked", type: "file" },
          { path: "/blocked/child.txt", type: "file" },
        ],
      }),
    ).toThrow(ConfigurationError);
    expect(() =>
      createMemoryProviderFactory({
        entries: [{ content: "not-a-file", path: "/directory", type: "directory" }],
      }),
    ).toThrow(ConfigurationError);
  });

  it("reads, writes, and copies memory transfer content", async () => {
    const client = createTransferClient({
      providers: [
        createMemoryProviderFactory({
          entries: [{ content: "abcdef", path: "/source.txt", type: "file" }],
        }),
      ],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      const transfers = requireTransfers(session);
      const rangeRead = await transfers.read(
        createReadRequest("/source.txt", { length: 3, offset: 1 }),
      );

      expect(rangeRead).toMatchObject({ bytesRead: 1, totalBytes: 3 });
      await expect(readText(rangeRead.content)).resolves.toBe("bcd");

      const writeResult = await transfers.write(
        createWriteRequest("/written/out.txt", textContent("done")),
      );

      expect(writeResult).toMatchObject({ bytesTransferred: 4, totalBytes: 4 });
      await expect(session.fs.stat("/written/out.txt")).resolves.toMatchObject({
        path: "/written/out.txt",
        size: 4,
        type: "file",
      });

      const executor = createProviderTransferExecutor({ resolveSession: () => session });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/copy.txt", provider: "memory" },
          id: "memory-copy",
          operation: "copy",
          source: { path: "/source.txt", provider: "memory" },
        },
        executor,
      );
      const copied = await transfers.read(createReadRequest("/copy.txt"));

      expect(receipt).toMatchObject({ bytesTransferred: 6, totalBytes: 6 });
      await expect(readText(copied.content)).resolves.toBe("abcdef");
    } finally {
      await session.disconnect();
    }
  });

  it("handles memory transfer ranges, resumed writes, verification, and errors", async () => {
    const verification: TransferVerificationResult = {
      actualChecksum: "abc123",
      checksum: "abc123",
      details: { algorithm: "fixture" },
      expectedChecksum: "abc123",
      method: "checksum",
      verified: true,
    };
    const client = createTransferClient({
      providers: [
        createMemoryProviderFactory({
          entries: [
            { content: Buffer.from("abcdef", "utf8"), path: "/source.txt", type: "file" },
            { path: "/folder", type: "directory" },
          ],
        }),
      ],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      const transfers = requireTransfers(session);
      const offsetRead = await transfers.read(createReadRequest("/source.txt", { offset: 2 }));
      const emptyRead = await transfers.read(
        createReadRequest("/source.txt", { length: 5, offset: 99 }),
      );

      expect(offsetRead).toMatchObject({ bytesRead: 2, totalBytes: 4 });
      await expect(readText(offsetRead.content)).resolves.toBe("cdef");
      expect(emptyRead).toMatchObject({ bytesRead: 6, totalBytes: 0 });
      await expect(readText(emptyRead.content)).resolves.toBe("");

      const resumed = await transfers.write(
        createWriteRequest("/source.txt", textContent("XY"), { offset: 2, verification }),
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

      const updated = await transfers.read(createReadRequest("/source.txt"));
      await expect(readText(updated.content)).resolves.toBe("abXYef");

      await expect(transfers.read(createReadRequest("/missing.txt"))).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(transfers.read(createReadRequest("/folder"))).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(
        transfers.write(createWriteRequest("/folder", textContent("x"))),
      ).rejects.toBeInstanceOf(ConfigurationError);
      await expect(
        transfers.write(
          createWriteRequest("/invalid-offset.txt", textContent("x"), {
            offset: -1,
          }),
        ),
      ).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });

  it("supports remove/rename/mkdir/rmdir branch coverage", async () => {
    const client = createTransferClient({
      providers: [
        createMemoryProviderFactory({
          entries: [
            { content: "abc", path: "/data/a.txt", type: "file" },
            { path: "/data/sub", type: "directory" },
            { content: "xyz", path: "/data/sub/x.txt", type: "file" },
          ],
        }),
      ],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });
    try {
      // remove existing file
      await session.fs.remove!("/data/a.txt");
      // remove missing with ignoreMissing
      await session.fs.remove!("/data/a.txt", { ignoreMissing: true });
      // remove missing without ignoreMissing
      await expect(session.fs.remove!("/data/a.txt")).rejects.toBeInstanceOf(PathNotFoundError);
      // remove directory throws
      await expect(session.fs.remove!("/data/sub")).rejects.toBeInstanceOf(PathNotFoundError);
      // rename missing
      await expect(session.fs.rename!("/data/missing", "/data/x")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      // rename file
      await session.fs.rename!("/data/sub/x.txt", "/data/sub/y.txt");
      // mkdir existing directory recursive (no-op)
      await session.fs.mkdir!("/data/sub", { recursive: true });
      // mkdir existing as conflict (file exists)
      await session.fs.mkdir!("/data/file2", { recursive: true });
      // mkdir without recursive when parent missing
      await expect(session.fs.mkdir!("/missing/parent/leaf")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      // mkdir conflict with existing entry
      await expect(session.fs.mkdir!("/data/sub")).rejects.toThrow(/already exists/);
      // rmdir missing with ignoreMissing
      await session.fs.rmdir!("/never", { ignoreMissing: true });
      // rmdir missing without
      await expect(session.fs.rmdir!("/never")).rejects.toBeInstanceOf(PathNotFoundError);
      // rmdir non-directory
      const session2 = await client.connect({ host: "memory.local", provider: "memory" });
      await session2.fs.mkdir?.("/d");
      await session2.disconnect();
      // rmdir non-empty without recursive
      await expect(session.fs.rmdir!("/data/sub")).rejects.toThrow(/not empty/);
      // rmdir recursive deeper - first add nested
      await session.fs.mkdir!("/data/deep/inner", { recursive: true });
      await session.fs.rmdir!("/data", { recursive: true });
    } finally {
      await session.disconnect();
    }
  });
});

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) {
    throw new Error("Expected memory provider transfer operations");
  }

  return session.transfers;
}

function createReadRequest(
  path: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path, provider: "memory" },
    job: { id: "memory-direct-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      createTestProgressEvent("memory-direct-read", bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };

  if (range !== undefined) {
    request.range = range;
  }

  return request;
}

function createWriteRequest(
  path: string,
  content: TransferDataSource,
  options: TestWriteOptions = {},
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    attempt: 1,
    content,
    endpoint: { path, provider: "memory" },
    job: { id: "memory-direct-write", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      createTestProgressEvent("memory-direct-write", bytesTransferred, totalBytes),
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
