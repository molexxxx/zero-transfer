import { Buffer } from "node:buffer";
import { createServer, createConnection, type Server, type Socket } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { afterEach, describe, expect, it } from "vitest";
import { ChaosProxy } from "./chaosProxy";

/**
 * Payload server: writes `payload` to every client as soon as it connects,
 * then half-closes. Drives downstream (server-to-client) fault tests.
 */
function startPayloadServer(payload: Buffer): Promise<{ server: Server; port: number }> {
  const server = createServer((socket) => {
    socket.on("error", () => undefined);
    socket.end(payload);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") throw new Error("no port");
      resolve({ port: address.port, server });
    });
  });
}

/** Echo server: writes every received chunk back. Drives upstream fault tests. */
function startEchoServer(): Promise<{ server: Server; port: number }> {
  const server = createServer((socket) => {
    socket.on("error", () => undefined);
    socket.on("data", (chunk) => socket.write(chunk));
    socket.on("end", () => socket.end());
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") throw new Error("no port");
      resolve({ port: address.port, server });
    });
  });
}

interface ClientResult {
  received: Buffer;
  closed: boolean;
  errored: boolean;
}

/** Connects to `port`, optionally writes `send`, and collects everything received. */
function runClient(
  port: number,
  options: { send?: Buffer; collectMs?: number } = {},
): Promise<ClientResult> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let errored = false;
    let settled = false;
    const socket: Socket = createConnection(port, "127.0.0.1", () => {
      if (options.send !== undefined) socket.write(options.send);
    });
    const finish = (closed: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ closed, errored, received: Buffer.concat(chunks) });
    };
    socket.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    socket.on("error", () => {
      errored = true;
    });
    socket.on("close", () => finish(true));
    if (options.collectMs !== undefined) {
      void sleep(options.collectMs).then(() => finish(false));
    }
  });
}

describe("ChaosProxy", () => {
  let proxy: ChaosProxy | undefined;
  let server: Server | undefined;

  afterEach(async () => {
    await proxy?.stop();
    proxy = undefined;
    await new Promise<void>((resolve) => {
      if (server === undefined) {
        resolve();
        return;
      }
      server.close(() => resolve());
      server = undefined;
    });
  });

  it("forwards bytes unchanged in both directions when no rules are set", async () => {
    const started = await startEchoServer();
    server = started.server;
    proxy = new ChaosProxy({ target: { host: "127.0.0.1", port: started.port } });
    const proxyPort = await proxy.start();

    const sent = Buffer.from("round-trip through the chaos proxy");
    const result = await runClient(proxyPort, { collectMs: 250, send: sent });

    expect(result.received).toEqual(sent);
    expect(proxy.connections).toHaveLength(1);
    expect(proxy.connections[0]).toMatchObject({
      reset: false,
      stalled: false,
      upstreamBytes: sent.length,
    });
  });

  it("forwards intact payloads when chunking and latency are applied", async () => {
    const payload = Buffer.alloc(16_384, 0x5a);
    const started = await startPayloadServer(payload);
    server = started.server;
    proxy = new ChaosProxy({
      rules: { downstream: { chunkBytes: 1000, latencyMs: 1 } },
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const result = await runClient(proxyPort);

    expect(result.received).toEqual(payload);
    expect(proxy.connections[0]?.downstreamBytes).toBe(payload.length);
  });

  it("destroys the connection after exactly resetAfterBytes downstream bytes", async () => {
    const payload = Buffer.alloc(64 * 1024, 0x42);
    const started = await startPayloadServer(payload);
    server = started.server;
    proxy = new ChaosProxy({
      rules: { downstream: { resetAfterBytes: 10_000 } },
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const result = await runClient(proxyPort);

    expect(result.closed).toBe(true);
    expect(result.received.length).toBe(10_000);
    expect(proxy.connections[0]).toMatchObject({ downstreamBytes: 10_000, reset: true });
  });

  it("stalls after exactly stallAfterBytes while keeping the connection open", async () => {
    const payload = Buffer.alloc(64 * 1024, 0x43);
    const started = await startPayloadServer(payload);
    server = started.server;
    proxy = new ChaosProxy({
      rules: { downstream: { stallAfterBytes: 12_345 } },
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const result = await runClient(proxyPort, { collectMs: 300 });

    expect(result.closed).toBe(false);
    expect(result.received.length).toBe(12_345);
    expect(proxy.connections[0]).toMatchObject({ downstreamBytes: 12_345, stalled: true });
  });

  it("applies different rules per connection index", async () => {
    const payload = Buffer.alloc(32 * 1024, 0x44);
    const started = await startPayloadServer(payload);
    server = started.server;
    proxy = new ChaosProxy({
      rules: (index) => (index === 0 ? { downstream: { resetAfterBytes: 5_000 } } : {}),
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const first = await runClient(proxyPort);
    const second = await runClient(proxyPort);

    expect(first.received.length).toBe(5_000);
    expect(second.received).toEqual(payload);
    expect(proxy.connections.map((connection) => connection.reset)).toEqual([true, false]);
  });

  it("cuts the upstream direction independently of downstream", async () => {
    const started = await startEchoServer();
    server = started.server;
    proxy = new ChaosProxy({
      rules: { upstream: { resetAfterBytes: 100 } },
      target: { host: "127.0.0.1", port: started.port },
    });
    const proxyPort = await proxy.start();

    const result = await runClient(proxyPort, { collectMs: 300, send: Buffer.alloc(500, 0x45) });

    expect(result.closed).toBe(true);
    expect(proxy.connections[0]).toMatchObject({ reset: true, upstreamBytes: 100 });
    expect(result.received.length).toBeLessThanOrEqual(100);
  });
});
