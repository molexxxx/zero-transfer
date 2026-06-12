import { describe, expect, it, vi } from "vitest";
import {
  ConnectionError,
  TransferEngine,
  createMemoryTransferCheckpointStore,
  createProviderTransferExecutor,
  type CapabilitySet,
  type ProviderTransferDiscardRequest,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type RemoteStat,
  type TransferCheckpointKey,
  type TransferCheckpointStore,
  type TransferJob,
  type TransferSession,
} from "../../../src/index";

const checkpointKey: TransferCheckpointKey = {
  destination: { path: "/remote/big.bin", provider: "dest" },
  source: { path: "/local/big.bin", provider: "src" },
};

const job: TransferJob = {
  destination: { path: "/remote/big.bin", provider: "dest" },
  id: "resume-job-1",
  operation: "upload",
  source: { path: "/local/big.bin", provider: "src" },
};

interface SessionConfig {
  provider: string;
  transfers: ProviderTransferOperations;
  stat?: RemoteStat | (() => RemoteStat | Promise<RemoteStat>);
  resumeDownload?: boolean;
  resumeUpload?: boolean;
}

function createSession(config: SessionConfig): TransferSession {
  const statValue = config.stat;
  return {
    capabilities: createCapabilities(config),
    disconnect: () => Promise.resolve(),
    fs: {
      list: () => Promise.resolve([]),
      stat: () => {
        if (statValue === undefined) {
          return Promise.reject(new Error("stat unavailable"));
        }
        return Promise.resolve(typeof statValue === "function" ? statValue() : statValue);
      },
    },
    provider: config.provider,
    transfers: config.transfers,
  };
}

function createCapabilities(config: SessionConfig): CapabilitySet {
  return {
    atomicRename: false,
    authentication: ["anonymous"],
    checksum: [],
    chmod: false,
    chown: false,
    list: true,
    metadata: [],
    provider: config.provider,
    readStream: true,
    resumeDownload: config.resumeDownload ?? true,
    resumeUpload: config.resumeUpload ?? true,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: true,
  };
}

function fileStat(size: number, modifiedAtMs = 1_700_000_000_000): RemoteStat {
  return {
    exists: true,
    modifiedAt: new Date(modifiedAtMs),
    name: "big.bin",
    path: "/local/big.bin",
    size,
    type: "file",
  };
}

async function* bytes(...chunks: number[][]): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  for (const chunk of chunks) yield Uint8Array.from(chunk);
}

async function drain(content: AsyncIterable<Uint8Array>): Promise<number> {
  let total = 0;
  for await (const chunk of content) total += chunk.byteLength;
  return total;
}

describe("createProviderTransferExecutor resume", () => {
  it("resumes from a valid byte-offset checkpoint and clears it on success", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save(checkpointKey, {
      createdAtMs: Date.now(),
      fingerprint: { modifiedAtMs: 1_700_000_000_000, sizeBytes: 100 },
      pid: process.pid,
      state: { committedBytes: 60, kind: "byte-offset" },
      updatedAtMs: Date.now(),
      version: 1,
    });

    const read = vi.fn((request: ProviderTransferReadRequest) => {
      expect(request.range).toEqual({ offset: 60 });
      return { bytesRead: 60, content: bytes([1, 2, 3, 4]), totalBytes: 40 };
    });
    const write = vi.fn(async (request: ProviderTransferWriteRequest) => {
      expect(request.offset).toBe(60);
      expect(request.checkpoint).toBeDefined();
      expect(request.checkpoint?.state).toEqual({ committedBytes: 60, kind: "byte-offset" });
      return { bytesTransferred: await drain(request.content) };
    });

    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(100), transfers: { read, write } })],
      [
        "dest",
        createSession({
          provider: "dest",
          // Destination holds at least the committed bytes.
          stat: fileStat(60),
          transfers: { read: vi.fn(), write },
        }),
      ],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });

    const receipt = await new TransferEngine().execute(job, executor);

    expect(receipt.resumed).toBe(true);
    expect(read).toHaveBeenCalledOnce();
    expect(await store.load(checkpointKey)).toBeUndefined();
  });

  it("trims the resume offset to the destination size", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save(checkpointKey, {
      createdAtMs: Date.now(),
      fingerprint: { sizeBytes: 100 },
      pid: process.pid,
      state: { committedBytes: 80, kind: "byte-offset" },
      updatedAtMs: Date.now(),
      version: 1,
    });

    const read = vi.fn((request: ProviderTransferReadRequest) => {
      expect(request.range).toEqual({ offset: 48 });
      return { content: bytes([0]) };
    });
    const write = vi.fn(async (request: ProviderTransferWriteRequest) => {
      expect(request.offset).toBe(48);
      return { bytesTransferred: await drain(request.content) };
    });
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(100), transfers: { read, write } })],
      [
        "dest",
        // Destination only ever flushed 48 of the checkpointed 80 bytes.
        createSession({
          provider: "dest",
          stat: fileStat(48),
          transfers: { read: vi.fn(), write },
        }),
      ],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });

    await new TransferEngine().execute(job, executor);
    expect(read).toHaveBeenCalledOnce();
  });

  it("invalidates checkpoints when the source fingerprint changed and discards provider state", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save(checkpointKey, {
      createdAtMs: Date.now(),
      fingerprint: { sizeBytes: 100 },
      pid: process.pid,
      state: {
        committedBytes: 32,
        kind: "parts",
        parts: [{ byteEnd: 32, partNumber: 1, token: "etag-1" }],
        partSizeBytes: 32,
        uploadToken: "upload-1",
      },
      updatedAtMs: Date.now(),
      version: 1,
    });

    const discardResumable = vi.fn<(request: ProviderTransferDiscardRequest) => Promise<void>>(() =>
      Promise.resolve(),
    );
    const read = vi.fn((request: ProviderTransferReadRequest) => {
      expect(request.range).toBeUndefined();
      return { content: bytes([1, 2]) };
    });
    const write = vi.fn(async (request: ProviderTransferWriteRequest) => {
      expect(request.offset).toBeUndefined();
      expect(request.checkpoint?.state).toBeUndefined();
      return { bytesTransferred: await drain(request.content) };
    });
    const sessions = new Map([
      // Source grew from 100 to 120 bytes since the checkpoint was written.
      ["src", createSession({ provider: "src", stat: fileStat(120), transfers: { read, write } })],
      [
        "dest",
        createSession({
          provider: "dest",
          stat: fileStat(32),
          transfers: { discardResumable, read: vi.fn(), write },
        }),
      ],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });

    const receipt = await new TransferEngine().execute(job, executor);

    expect(receipt.resumed).toBe(false);
    expect(discardResumable).toHaveBeenCalledOnce();
    expect(discardResumable.mock.calls[0]?.[0]).toMatchObject({
      endpoint: { path: "/remote/big.bin", provider: "dest" },
      state: { kind: "parts", uploadToken: "upload-1" },
    });
  });

  it("persists byte-offset commits and resumes in-process across engine retries", async () => {
    const store = createMemoryTransferCheckpointStore();
    let attempts = 0;
    const writeOffsets: Array<number | undefined> = [];

    const read = vi.fn((request: ProviderTransferReadRequest) => ({
      content: bytes([1, 1], [2, 2], [3, 3]),
      ...(request.range !== undefined ? { bytesRead: request.range.offset } : {}),
    }));
    const write = vi.fn(async (request: ProviderTransferWriteRequest) => {
      attempts += 1;
      writeOffsets.push(request.offset);
      let written = request.offset ?? 0;
      const iterator = request.content[Symbol.asyncIterator]();
      // First attempt: commit one chunk, then die.
      const first = await iterator.next();
      if (first.done !== true) {
        written += first.value.byteLength;
        request.onBytesCommitted?.(written);
      }
      if (attempts === 1) {
        throw new ConnectionError({ message: "boom", retryable: true });
      }
      while (true) {
        const next = await iterator.next();
        if (next.done === true) break;
        written += next.value.byteLength;
        request.onBytesCommitted?.(written);
      }
      return { bytesTransferred: written };
    });

    let destSize = 0;
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(6), transfers: { read, write } })],
      [
        "dest",
        createSession({
          provider: "dest",
          stat: () => fileStat(destSize),
          transfers: { read: vi.fn(), write },
        }),
      ],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      // Persist on every commit so the first attempt checkpoints chunk 1.
      resume: { persistIntervalBytes: 1, store },
    });

    // After attempt 1 the destination holds the 2 committed bytes.
    const engine = new TransferEngine();
    const promise = engine.execute(job, executor, { retry: { maxAttempts: 2 } });
    destSize = 2;
    const receipt = await promise;

    expect(writeOffsets).toEqual([undefined, 2]);
    expect(receipt.resumed).toBe(true);
    expect(await store.load(checkpointKey)).toBeUndefined();
  });

  it("throws for mode 'require' when an endpoint cannot resume", async () => {
    const store = createMemoryTransferCheckpointStore();
    const transfers: ProviderTransferOperations = {
      read: () => ({ content: bytes([1]) }),
      write: async (request) => ({ bytesTransferred: await drain(request.content) }),
    };
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(1), transfers })],
      [
        "dest",
        createSession({ provider: "dest", resumeUpload: false, stat: fileStat(0), transfers }),
      ],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { mode: "require", store },
    });

    await expect(new TransferEngine().execute(job, executor)).rejects.toMatchObject({
      details: {
        attempts: [{ error: { code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE" } }],
      },
    });
  });

  it("skips resume entirely for mode 'off' and incapable endpoints in 'auto'", async () => {
    const load = vi.fn(() => undefined);
    const store: TransferCheckpointStore = {
      clear: vi.fn(),
      load,
      save: vi.fn(),
    };
    const transfers: ProviderTransferOperations = {
      read: (request) => {
        expect(request.range).toBeUndefined();
        return { content: bytes([1]) };
      },
      write: async (request) => {
        expect(request.checkpoint).toBeUndefined();
        return { bytesTransferred: await drain(request.content) };
      },
    };
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(1), transfers })],
      ["dest", createSession({ provider: "dest", stat: fileStat(0), transfers })],
    ]);

    const offExecutor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { mode: "off", store },
    });
    await new TransferEngine().execute(job, offExecutor);
    expect(load).not.toHaveBeenCalled();

    const incapableSessions = new Map([
      [
        "src",
        createSession({ provider: "src", resumeDownload: false, stat: fileStat(1), transfers }),
      ],
      ["dest", createSession({ provider: "dest", stat: fileStat(0), transfers })],
    ]);
    const autoExecutor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => incapableSessions.get(endpoint.provider ?? ""),
      resume: { store },
    });
    await new TransferEngine().execute(job, autoExecutor);
    expect(load).not.toHaveBeenCalled();
  });

  it("warns when another process updated the checkpoint moments ago", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save(checkpointKey, {
      createdAtMs: Date.now(),
      fingerprint: { sizeBytes: 4 },
      pid: process.pid + 1,
      state: { committedBytes: 2, kind: "byte-offset" },
      updatedAtMs: Date.now(),
      version: 1,
    });

    const transfers: ProviderTransferOperations = {
      read: () => ({ content: bytes([3, 4]) }),
      write: async (request) => ({ bytesTransferred: await drain(request.content) }),
    };
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(4), transfers })],
      ["dest", createSession({ provider: "dest", stat: fileStat(2), transfers })],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });

    const receipt = await new TransferEngine().execute(job, executor);
    expect(receipt.warnings.some((warning) => warning.includes("another process"))).toBe(true);
  });

  it("restarts when the byte-offset destination no longer exists", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save(checkpointKey, {
      createdAtMs: Date.now(),
      fingerprint: { sizeBytes: 4 },
      pid: process.pid,
      state: { committedBytes: 2, kind: "byte-offset" },
      updatedAtMs: Date.now(),
      version: 1,
    });

    const read = vi.fn((request: ProviderTransferReadRequest) => {
      expect(request.range).toBeUndefined();
      return { content: bytes([1, 2, 3, 4]) };
    });
    const write = vi.fn(async (request: ProviderTransferWriteRequest) => {
      expect(request.offset).toBeUndefined();
      return { bytesTransferred: await drain(request.content) };
    });
    const sessions = new Map([
      ["src", createSession({ provider: "src", stat: fileStat(4), transfers: { read, write } })],
      // Destination stat rejects: the partial file vanished.
      ["dest", createSession({ provider: "dest", transfers: { read: vi.fn(), write } })],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });

    const receipt = await new TransferEngine().execute(job, executor);
    expect(receipt.resumed).toBe(false);
    expect(await store.load(checkpointKey)).toBeUndefined();
  });
});
