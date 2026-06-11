import { Buffer } from "node:buffer";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import {
  TransferEngine,
  TransferError,
  createDefaultRetryPolicy,
  createHttpProviderFactory,
  createProviderTransferExecutor,
  type CapabilitySet,
  type ProviderTransferOperations,
  type ProviderTransferWriteRequest,
  type TransferJob,
  type TransferSession,
} from "../../src/index";
import { ChaosProxy } from "./chaosProxy";

/**
 * End-to-end chaos scenarios: a real HTTP origin server behind the chaos
 * proxy, downloaded through the HTTP provider and the transfer engine, with
 * the production retry policy and stall watchdog. These are the deterministic
 * "kill the connection at byte N" tests the chaos proxy exists for.
 */

const PAYLOAD = Buffer.from(Array.from({ length: 256 * 1024 }, (_, index) => index % 251));

function startOriginServer(): Promise<{ server: Server; port: number }> {
  const server = createServer((request, response) => {
    if (request.method === "GET" && request.url === "/file.bin") {
      response.writeHead(200, {
        "content-length": String(PAYLOAD.length),
        "content-type": "application/octet-stream",
      });
      response.end(PAYLOAD);
      return;
    }
    response.writeHead(404);
    response.end();
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") throw new Error("no port");
      resolve({ port: address.port, server });
    });
  });
}

/** In-memory destination that reports progress per chunk (feeds the stall watchdog). */
function createCollector(): {
  transfers: ProviderTransferOperations;
  bytes: () => Buffer;
} {
  let completed = Buffer.alloc(0);
  const transfers: ProviderTransferOperations = {
    read: () => {
      throw new Error("collector is write-only");
    },
    write: async (request: ProviderTransferWriteRequest) => {
      const chunks: Buffer[] = [];
      let bytesTransferred = 0;
      for await (const chunk of request.content) {
        chunks.push(Buffer.from(chunk));
        bytesTransferred += chunk.byteLength;
        request.reportProgress(bytesTransferred, request.totalBytes);
      }
      completed = Buffer.concat(chunks);
      return { bytesTransferred };
    },
  };
  return { bytes: () => completed, transfers };
}

function collectorCapabilities(): CapabilitySet {
  return {
    atomicRename: false,
    authentication: ["anonymous"],
    checksum: [],
    chmod: false,
    chown: false,
    list: false,
    metadata: [],
    provider: "collector",
    readStream: false,
    resumeDownload: false,
    resumeUpload: false,
    serverSideCopy: false,
    serverSideMove: false,
    stat: false,
    symlink: false,
    writeStream: true,
  };
}

function createCollectorSession(transfers: ProviderTransferOperations): TransferSession {
  return {
    capabilities: collectorCapabilities(),
    disconnect: () => Promise.resolve(),
    fs: {
      list: () => Promise.resolve([]),
      stat: () =>
        Promise.resolve({
          exists: true as const,
          name: "collected",
          path: "/",
          type: "directory" as const,
        }),
    },
    provider: "collector",
    transfers,
  };
}

const job: TransferJob = {
  destination: { path: "/collected/file.bin", provider: "collector" },
  id: "chaos-download-1",
  operation: "download",
  source: { path: "/file.bin", provider: "http" },
};

describe("chaos transfer scenarios (HTTP through the chaos proxy)", () => {
  let origin: Server | undefined;
  let proxy: ChaosProxy | undefined;
  let httpSession: TransferSession | undefined;

  afterEach(async () => {
    await httpSession?.disconnect();
    httpSession = undefined;
    await proxy?.stop();
    proxy = undefined;
    await new Promise<void>((resolve) => {
      if (origin === undefined) {
        resolve();
        return;
      }
      origin.close(() => resolve());
      origin = undefined;
    });
  });

  async function setup(rules: ConstructorParameters<typeof ChaosProxy>[0]["rules"]): Promise<{
    executor: ReturnType<typeof createProviderTransferExecutor>;
    collector: ReturnType<typeof createCollector>;
  }> {
    const started = await startOriginServer();
    origin = started.server;
    proxy = new ChaosProxy({
      ...(rules !== undefined ? { rules } : {}),
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const factory = createHttpProviderFactory();
    httpSession = await factory.create().connect({
      host: "127.0.0.1",
      port: proxyPort,
      protocol: "ftp",
    });

    const collector = createCollector();
    const sessions = new Map<string, TransferSession>([
      ["http", httpSession],
      ["collector", createCollectorSession(collector.transfers)],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
    });
    return { collector, executor };
  }

  it("retries exactly once and delivers identical bytes when the connection is killed at byte 64k", async () => {
    const { collector, executor } = await setup((index) =>
      index === 0 ? { downstream: { resetAfterBytes: 64 * 1024 } } : {},
    );

    const receipt = await new TransferEngine().execute(job, executor, {
      retry: createDefaultRetryPolicy({ baseDelayMs: 1, maxDelayMs: 2 }),
    });

    expect(receipt.attempts).toHaveLength(2);
    expect(receipt.attempts[0]?.error).toMatchObject({ code: "ZERO_TRANSFER_CONNECTION_ERROR" });
    expect(receipt.attempts[1]?.error).toBeUndefined();
    expect(receipt.bytesTransferred).toBe(PAYLOAD.length);
    expect(collector.bytes().equals(PAYLOAD)).toBe(true);
    expect(proxy?.connections[0]?.reset).toBe(true);
  }, 15_000);

  it("fires the stall watchdog on a silent connection and recovers on retry", async () => {
    const { collector, executor } = await setup((index) =>
      index === 0 ? { downstream: { stallAfterBytes: 32 * 1024 } } : {},
    );

    const receipt = await new TransferEngine().execute(job, executor, {
      retry: createDefaultRetryPolicy({ baseDelayMs: 1, maxDelayMs: 2 }),
      timeout: { stallTimeoutMs: 250 },
    });

    expect(receipt.attempts).toHaveLength(2);
    expect(receipt.attempts[0]?.error).toMatchObject({ code: "ZERO_TRANSFER_TIMEOUT" });
    expect(collector.bytes().equals(PAYLOAD)).toBe(true);
    expect(proxy?.connections[0]?.stalled).toBe(true);
  }, 15_000);

  it("exhausts attempts with a TransferError when every connection is killed", async () => {
    const { executor } = await setup({ downstream: { resetAfterBytes: 16 * 1024 } });

    await expect(
      new TransferEngine().execute(job, executor, {
        retry: createDefaultRetryPolicy({ baseDelayMs: 1, maxAttempts: 3, maxDelayMs: 2 }),
      }),
    ).rejects.toBeInstanceOf(TransferError);

    expect(proxy?.connections.length).toBe(3);
    expect(proxy?.connections.every((connection) => connection.reset)).toBe(true);
  }, 15_000);
});
