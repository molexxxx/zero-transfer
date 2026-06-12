import { Buffer } from "node:buffer";
import { createServer, type Server } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  TransferEngine,
  createDefaultRetryPolicy,
  createHttpProviderFactory,
  createLocalProviderFactory,
  createMemoryTransferCheckpointStore,
  createProviderTransferExecutor,
  type TransferJob,
  type TransferSession,
} from "../../src/index";
import { ChaosProxy } from "./chaosProxy";

/**
 * The end-to-end proof for B2 resume: a ranged HTTP origin behind the chaos
 * proxy, downloaded to a real local-provider destination with checkpoints.
 * The first connection is killed at byte N; the retry must resume exactly
 * once from the committed watermark (a ranged request, not a restart) and
 * the delivered bytes must be identical.
 */

const PAYLOAD = Buffer.from(Array.from({ length: 256 * 1024 }, (_, index) => index % 251));
const KILL_AT = 64 * 1024;
const LAST_MODIFIED = "Wed, 01 Jan 2025 00:00:00 GMT";

interface OriginRequest {
  method: string;
  range: string | undefined;
}

function startRangedOriginServer(requests: OriginRequest[]): Promise<{
  server: Server;
  port: number;
}> {
  const server = createServer((request, response) => {
    requests.push({ method: request.method ?? "", range: request.headers.range });
    if (request.url !== "/file.bin") {
      response.writeHead(404);
      response.end();
      return;
    }
    if (request.method === "HEAD") {
      response.writeHead(200, {
        "accept-ranges": "bytes",
        "content-length": String(PAYLOAD.length),
        "content-type": "application/octet-stream",
        "last-modified": LAST_MODIFIED,
      });
      response.end();
      return;
    }
    const range = request.headers.range;
    if (range !== undefined) {
      const match = /^bytes=(\d+)-$/.exec(range);
      const start = Number(match?.[1] ?? 0);
      response.writeHead(206, {
        "content-length": String(PAYLOAD.length - start),
        "content-range": `bytes ${String(start)}-${String(PAYLOAD.length - 1)}/${String(PAYLOAD.length)}`,
        "content-type": "application/octet-stream",
        "last-modified": LAST_MODIFIED,
      });
      response.end(PAYLOAD.subarray(start));
      return;
    }
    response.writeHead(200, {
      "accept-ranges": "bytes",
      "content-length": String(PAYLOAD.length),
      "content-type": "application/octet-stream",
      "last-modified": LAST_MODIFIED,
    });
    response.end(PAYLOAD);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") throw new Error("no port");
      resolve({ port: address.port, server });
    });
  });
}

describe("chaos resume scenario (kill at byte N, resume from watermark)", () => {
  let origin: Server | undefined;
  let proxy: ChaosProxy | undefined;
  let httpSession: TransferSession | undefined;
  let localSession: TransferSession | undefined;
  let tempDir: string | undefined;

  afterEach(async () => {
    await httpSession?.disconnect();
    httpSession = undefined;
    await localSession?.disconnect();
    localSession = undefined;
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
    if (tempDir !== undefined) {
      await rm(tempDir, { force: true, recursive: true });
      tempDir = undefined;
    }
  });

  it("resumes exactly once from the committed watermark with identical bytes", async () => {
    const requests: OriginRequest[] = [];
    const started = await startRangedOriginServer(requests);
    origin = started.server;

    // Kill connections at KILL_AT downstream bytes until the first reset has
    // happened, then run clean. Keyed off proxy telemetry so the rule holds
    // no matter how undici pools the HEAD/GET requests onto connections.
    // Bytes trickle in small delayed chunks so the consumer commits data
    // before the reset lands (on localhost an unthrottled kill outruns the
    // reader and undici drops the buffered body with the error).
    proxy = new ChaosProxy({
      rules: () =>
        proxy?.connections.some((connection) => connection.reset) === true
          ? {}
          : { downstream: { chunkBytes: 8 * 1024, latencyMs: 2, resetAfterBytes: KILL_AT } },
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    httpSession = await createHttpProviderFactory()
      .create()
      .connect({ host: "127.0.0.1", port: proxyPort, protocol: "ftp" });
    tempDir = await mkdtemp(join(tmpdir(), "zt-chaos-resume-"));
    localSession = await createLocalProviderFactory({ rootPath: tempDir })
      .create()
      .connect({ host: tempDir, provider: "local" });

    const sessions = new Map<string, TransferSession>([
      ["http", httpSession],
      ["local", localSession],
    ]);
    const store = createMemoryTransferCheckpointStore();
    const executor = createProviderTransferExecutor({
      resolveSession: ({ endpoint }) => sessions.get(endpoint.provider ?? ""),
      resume: { store },
    });
    const job: TransferJob = {
      destination: { path: "/file.bin", provider: "local" },
      id: "chaos-resume-1",
      operation: "download",
      source: { path: "/file.bin", provider: "http" },
    };

    const receipt = await new TransferEngine().execute(job, executor, {
      retry: createDefaultRetryPolicy({ baseDelayMs: 1, maxDelayMs: 2 }),
    });

    // Exactly one retry: attempt 1 died, attempt 2 succeeded.
    expect(receipt.attempts).toHaveLength(2);
    expect(receipt.attempts[0]?.error).toMatchObject({ code: "ZERO_TRANSFER_CONNECTION_ERROR" });
    expect(receipt.attempts[1]?.error).toBeUndefined();
    expect(receipt.resumed).toBe(true);

    // The retry was a ranged request from the committed watermark - never a
    // restart from byte zero, and never beyond what the proxy let through.
    const gets = requests.filter((request) => request.method === "GET");
    expect(gets).toHaveLength(2);
    expect(gets[0]?.range).toBeUndefined();
    const resumeRange = gets[1]?.range;
    expect(resumeRange).toMatch(/^bytes=\d+-$/);
    const resumeOffset = Number(/^bytes=(\d+)-$/.exec(resumeRange ?? "")?.[1]);
    expect(resumeOffset).toBeGreaterThan(0);
    expect(resumeOffset).toBeLessThanOrEqual(KILL_AT);

    // Delivered bytes are identical to the source payload.
    const delivered = await readFile(join(tempDir ?? "", "file.bin"));
    expect(delivered.length).toBe(PAYLOAD.length);
    expect(delivered.equals(PAYLOAD)).toBe(true);

    // The checkpoint was cleared on success.
    expect(
      await store.load({
        destination: { path: "/file.bin", provider: "local" },
        source: { path: "/file.bin", provider: "http" },
      }),
    ).toBeUndefined();

    expect(proxy.connections.some((connection) => connection.reset)).toBe(true);
  }, 15_000);
});
