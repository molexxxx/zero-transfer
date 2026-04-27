import { describe, expect, it, vi } from "vitest";
import {
  TransferEngine,
  TransferError,
  createProviderTransferExecutor,
  type CapabilitySet,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferJob,
  type TransferSession,
} from "../../../src/index";

const baseJob: TransferJob = {
  destination: { path: "/remote/report.csv", provider: "memory" },
  id: "provider-transfer-1",
  operation: "upload",
  source: { path: "/local/report.csv", provider: "local" },
  totalBytes: 3,
};

describe("createProviderTransferExecutor", () => {
  it("pipes provider read content into provider write operations", async () => {
    const progress = vi.fn();
    const content = createContent([1, 2, 3]);
    const sourceRead = vi.fn((request: ProviderTransferReadRequest) => {
      request.endpoint.path = "/mutated";
      request.reportProgress(1, 3);

      expect(request.bandwidthLimit).toEqual({ bytesPerSecond: 128 });
      expect(request.endpoint.provider).toBe("local");

      return {
        content,
        totalBytes: 3,
        verification: { checksum: "sha256:source", method: "checksum", verified: true },
        warnings: ["read-side warning"],
      };
    });
    const destinationWrite = vi.fn(async (request: ProviderTransferWriteRequest) => {
      const bytesTransferred = await countBytes(request.content);

      expect(request.bandwidthLimit).toEqual({ bytesPerSecond: 128 });
      expect(request.endpoint).toEqual({ path: "/remote/report.csv", provider: "memory" });
      expect(request.totalBytes).toBe(3);
      expect(request.verification).toEqual({
        checksum: "sha256:source",
        method: "checksum",
        verified: true,
      });

      return {
        bytesTransferred,
        verification: { checksum: "sha256:dest", method: "checksum", verified: true },
        warnings: ["write-side warning"],
      };
    });
    const sourceTransfers: ProviderTransferOperations = {
      read: sourceRead,
      write: vi.fn(() => ({ bytesTransferred: 0 })),
    };
    const destinationTransfers: ProviderTransferOperations = {
      read: vi.fn(() => ({ content })),
      write: destinationWrite,
    };
    const sessions = new Map([
      ["local", createSession("local", sourceTransfers)],
      ["memory", createSession("memory", destinationTransfers)],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
    });
    const receipt = await new TransferEngine().execute(baseJob, executor, {
      bandwidthLimit: { bytesPerSecond: 128 },
      onProgress: progress,
    });

    expect(sourceRead).toHaveBeenCalledOnce();
    expect(destinationWrite).toHaveBeenCalledOnce();
    expect(progress).toHaveBeenCalledWith(
      expect.objectContaining({ bytesTransferred: 1, totalBytes: 3 }),
    );
    expect(receipt).toMatchObject({
      bytesTransferred: 3,
      checksum: "sha256:dest",
      source: { path: "/local/report.csv", provider: "local" },
      totalBytes: 3,
      verification: { checksum: "sha256:dest", method: "checksum", verified: true },
      warnings: ["read-side warning", "write-side warning"],
    });
  });

  it("wraps missing sessions and unsupported operations in transfer failures", async () => {
    const executor = createProviderTransferExecutor({ resolveSession: () => undefined });
    let missingSessionError: unknown;

    try {
      await new TransferEngine().execute(baseJob, executor);
    } catch (error) {
      missingSessionError = error;
    }

    expect(missingSessionError).toBeInstanceOf(TransferError);
    expect((missingSessionError as TransferError).details).toMatchObject({
      attempts: [
        {
          error: {
            code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE",
          },
        },
      ],
    });

    await expect(
      new TransferEngine().execute({ ...baseJob, operation: "delete" }, executor),
    ).rejects.toMatchObject({
      details: {
        attempts: [
          {
            error: { code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE" },
          },
        ],
      },
    });
  });

  it("passes abort signals and resume offsets while falling back to read verification", async () => {
    const controller = new AbortController();
    const resumedJob: TransferJob = {
      destination: { path: "/remote/resume.bin", provider: "memory" },
      id: "provider-transfer-resume",
      operation: "copy",
      resumed: true,
      source: { path: "/local/resume.bin", provider: "local" },
    };
    const sourceRead = vi.fn((request: ProviderTransferReadRequest) => {
      expect(request.signal?.aborted).toBe(false);
      expect(request.bandwidthLimit).toBeUndefined();

      return {
        bytesRead: 2,
        checksum: "sha256:read",
        content: createContent([4, 5]),
        verification: {
          actualChecksum: "sha256:read",
          details: { side: "source" },
          expectedChecksum: "sha256:read",
          method: "checksum",
          verified: true,
        },
      };
    });
    const destinationWrite = vi.fn(async (request: ProviderTransferWriteRequest) => {
      expect(request.offset).toBe(2);
      expect(request.signal?.aborted).toBe(false);
      expect(request.totalBytes).toBeUndefined();

      return {
        bytesTransferred: await countBytes(request.content),
        resumed: true,
        verified: true,
      };
    });
    const sessions = new Map([
      ["local", createSession("local", { read: sourceRead, write: vi.fn() })],
      ["memory", createSession("memory", { read: vi.fn(), write: destinationWrite })],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
    });
    const receipt = await new TransferEngine().execute(resumedJob, executor, {
      signal: controller.signal,
    });

    expect(receipt).toMatchObject({
      bytesTransferred: 2,
      checksum: "sha256:read",
      resumed: true,
      verification: {
        actualChecksum: "sha256:read",
        details: { side: "source" },
        expectedChecksum: "sha256:read",
        method: "checksum",
        verified: true,
      },
      warnings: [],
    });
  });

  it("wraps sessions without transfer operations and missing endpoints", async () => {
    const sessionWithoutTransfers = createSession("local", undefined);
    const executor = createProviderTransferExecutor({
      resolveSession: () => sessionWithoutTransfers,
    });

    await expect(new TransferEngine().execute(baseJob, executor)).rejects.toMatchObject({
      details: {
        attempts: [
          {
            error: { code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE" },
          },
        ],
      },
    });

    await expect(
      new TransferEngine().execute(
        {
          id: "missing-destination",
          operation: "upload",
          source: { path: "/local/report.csv", provider: "local" },
        },
        executor,
      ),
    ).rejects.toMatchObject({
      details: {
        attempts: [
          {
            error: { code: "ZERO_TRANSFER_CONFIGURATION_ERROR" },
          },
        ],
      },
    });
  });
});

async function* createContent(bytes: number[]): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  yield Uint8Array.from(bytes);
}

async function countBytes(content: TransferDataSource): Promise<number> {
  let bytesTransferred = 0;

  for await (const chunk of content) {
    bytesTransferred += chunk.byteLength;
  }

  return bytesTransferred;
}

function createSession(
  provider: string,
  transfers: ProviderTransferOperations | undefined,
): TransferSession {
  const session: TransferSession = {
    capabilities: createCapabilities(provider),
    disconnect: () => Promise.resolve(),
    fs: {
      list: () => Promise.resolve([]),
      stat: () =>
        Promise.resolve({
          exists: true,
          name: "root",
          path: "/",
          type: "directory",
        }),
    },
    provider,
  };

  if (transfers !== undefined) {
    session.transfers = transfers;
  }

  return session;
}

function createCapabilities(provider: string): CapabilitySet {
  return {
    atomicRename: false,
    authentication: ["anonymous"],
    checksum: [],
    chmod: false,
    chown: false,
    list: true,
    metadata: [],
    provider,
    readStream: true,
    resumeDownload: false,
    resumeUpload: false,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: true,
  };
}
