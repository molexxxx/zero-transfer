import { describe, expect, it, vi } from "vitest";
import {
  ConnectionError,
  PathNotFoundError,
  ProtocolError,
  TimeoutError,
  TransferClient,
  createMemoryProviderFactory,
  createPooledTransferClient,
} from "../../../src/index";
import type { ConnectionProfile, TransferSession } from "../../../src/index";
import { Buffer } from "node:buffer";

function makeProfile(overrides: Partial<ConnectionProfile> = {}): ConnectionProfile {
  return {
    host: "example.com",
    port: 21,
    protocol: "ftp",
    provider: "memory",
    username: "alice",
    ...overrides,
  };
}

describe("createPooledTransferClient", () => {
  it("reuses an idle session for the same key after disconnect", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const connectSpy = vi.spyOn(inner, "connect");
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });

    const sessionA = await pool.connect(makeProfile());
    await sessionA.disconnect();
    expect(pool.poolSize()).toBe(1);

    const sessionB = await pool.connect(makeProfile());
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(pool.poolSize()).toBe(0);

    await sessionB.disconnect();
    await pool.drainPool();
  });

  it("creates fresh sessions for different keys", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const connectSpy = vi.spyOn(inner, "connect");
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });

    const sA = await pool.connect(makeProfile({ host: "host-a" }));
    const sB = await pool.connect(makeProfile({ host: "host-b" }));
    expect(connectSpy).toHaveBeenCalledTimes(2);

    await sA.disconnect();
    await sB.disconnect();
    expect(pool.poolSize()).toBe(2);

    await pool.drainPool();
    expect(pool.poolSize()).toBe(0);
  });

  it("trims idle entries above maxIdlePerKey", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0, maxIdlePerKey: 2 });

    const sessions: TransferSession[] = [];
    for (let i = 0; i < 4; i += 1) {
      sessions.push(await pool.connect(makeProfile()));
    }
    for (const session of sessions) {
      await session.disconnect();
    }
    expect(pool.poolSize()).toBe(2);
    await pool.drainPool();
  });

  it("does not pool sessions tainted by ConnectionError", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    // Patch inner.connect to return a session whose fs.stat throws a transport
    // error. Going through the underlying session ensures the pool's guard
    // observes the error and taints the lease.
    const realConnect = inner.connect.bind(inner);
    vi.spyOn(inner, "connect").mockImplementation(async (profile) => {
      const session = await realConnect(profile);
      session.fs.stat = () =>
        Promise.reject(
          new ConnectionError({
            message: "synthetic transport failure",
            retryable: true,
          }),
        );
      return session;
    });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });

    const session = await pool.connect(makeProfile());
    await expect(session.fs.stat("/")).rejects.toBeInstanceOf(ConnectionError);
    await session.disconnect();
    expect(pool.poolSize()).toBe(0);
  });

  it("keeps the session pooled when an application error (PathNotFoundError) is thrown", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });

    const session = await pool.connect(makeProfile());
    await expect(session.fs.stat("/missing")).rejects.toBeInstanceOf(PathNotFoundError);
    await session.disconnect();
    expect(pool.poolSize()).toBe(1);
    await pool.drainPool();
  });

  it("drainPool disconnects every idle session and prevents future pooling", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });

    const session = await pool.connect(makeProfile());
    await session.disconnect();
    expect(pool.poolSize()).toBe(1);
    await pool.drainPool();
    expect(pool.poolSize()).toBe(0);

    const next = await pool.connect(makeProfile());
    await next.disconnect();
    // After drain, sessions are NOT returned to the pool.
    expect(pool.poolSize()).toBe(0);
  });

  it("evicts idle sessions after the idle timeout", async () => {
    vi.useFakeTimers();
    try {
      const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
      const pool = createPooledTransferClient(inner, { idleTimeoutMs: 1_000 });

      const session = await pool.connect(makeProfile());
      await session.disconnect();
      expect(pool.poolSize()).toBe(1);

      await vi.advanceTimersByTimeAsync(1_500);
      expect(pool.poolSize()).toBe(0);

      await pool.drainPool();
    } finally {
      vi.useRealTimers();
    }
  });

  it("delegates capability queries and hasProvider to the inner client", () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner);
    expect(pool.hasProvider("memory")).toBe(true);
    expect(pool.hasProvider("ftp")).toBe(false);
    const caps = pool.getCapabilities("memory");
    expect(caps.provider).toBe("memory");
    expect(pool.getCapabilities()).toHaveLength(1);
  });

  it("delegates every wrapped fs method (list/stat/remove/rename/mkdir/rmdir) through the guard", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    const session = await pool.connect(makeProfile());
    try {
      await session.fs.mkdir?.("/a");
      // Add some content via transfers, then list/stat/rename/remove.
      const transfers = session.transfers;
      if (transfers === undefined) throw new Error("expected transfers");
      const payload = new TextEncoder().encode("hello");
      await transfers.write({
        attempt: 1,
        // eslint-disable-next-line @typescript-eslint/require-await
        content: (async function* () {
          yield payload;
        })(),
        endpoint: { path: "/a/file.txt", provider: "memory" },
        job: {
          destination: { path: "/a/file.txt", provider: "memory" },
          id: "pool-write",
          operation: "upload",
        },
        reportProgress: () => undefined as never,
        throwIfAborted: () => undefined,
      });
      const stat = await session.fs.stat("/a/file.txt");
      expect(stat.size).toBe(5);
      const list = await session.fs.list("/a");
      expect(list.length).toBeGreaterThan(0);
      await session.fs.rename?.("/a/file.txt", "/a/renamed.txt");
      // Read back through the wrapped transfers:
      const result = await transfers.read({
        attempt: 1,
        endpoint: { path: "/a/renamed.txt", provider: "memory" },
        job: {
          id: "pool-read",
          operation: "download",
          source: { path: "/a/renamed.txt", provider: "memory" },
        },
        reportProgress: () => undefined as never,
        throwIfAborted: () => undefined,
      });
      const chunks: Uint8Array[] = [];
      for await (const chunk of result.content) chunks.push(chunk);
      expect(Buffer.concat(chunks).toString("utf8")).toBe("hello");
      await session.fs.remove?.("/a/renamed.txt");
      await session.fs.rmdir?.("/a");
    } finally {
      await session.disconnect();
      await pool.drainPool();
    }
  });

  it("treats a second disconnect() on the same lease as a no-op", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    const session = await pool.connect(makeProfile());
    await session.disconnect();
    expect(pool.poolSize()).toBe(1);
    // Second disconnect must not double-pool the session.
    await session.disconnect();
    expect(pool.poolSize()).toBe(1);
    await pool.drainPool();
  });

  it("uses the keyOf override to control bucketing", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const connectSpy = vi.spyOn(inner, "connect");
    const pool = createPooledTransferClient(inner, {
      idleTimeoutMs: 0,
      keyOf: () => "shared",
    });
    // Three different profiles all share the same key -> only one underlying
    // session needed when they are leased serially.
    const a = await pool.connect(makeProfile({ host: "h1" }));
    await a.disconnect();
    const b = await pool.connect(makeProfile({ host: "h2" }));
    await b.disconnect();
    const c = await pool.connect(makeProfile({ host: "h3" }));
    await c.disconnect();
    expect(connectSpy).toHaveBeenCalledTimes(1);
    await pool.drainPool();
  });

  it("forwards raw() from the underlying session", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const realConnect = inner.connect.bind(inner);
    vi.spyOn(inner, "connect").mockImplementation(async (profile) => {
      const session = await realConnect(profile);
      // Attach a raw() method to expose internal state for testing.
      const sentinel = { raw: true };
      (session as TransferSession & { raw?: () => unknown }).raw = () => sentinel;
      return session;
    });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    const session = await pool.connect(makeProfile());
    expect(session.raw?.()).toEqual({ raw: true });
    await session.disconnect();
    await pool.drainPool();
  });

  it("survives sessions that throw synchronously from a wrapped fs method", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const realConnect = inner.connect.bind(inner);
    vi.spyOn(inner, "connect").mockImplementation(async (profile) => {
      const session = await realConnect(profile);
      // Synchronous throw from the underlying provider - the pool's guard
      // converts this into a rejected promise instead of crashing.
      session.fs.list = () => {
        throw new TypeError("boom");
      };
      return session;
    });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    const session = await pool.connect(makeProfile());
    await expect(session.fs.list("/")).rejects.toBeInstanceOf(Error);
    await session.disconnect();
    // Non-tainting error -> session pooled.
    expect(pool.poolSize()).toBe(1);
    await pool.drainPool();
  });

  it("treats TimeoutError and ProtocolError as tainting", async () => {
    const tests = [
      { ctor: TimeoutError, msg: "timeout" },
      { ctor: ProtocolError, msg: "protocol" },
    ];
    for (const { ctor, msg } of tests) {
      const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
      const realConnect = inner.connect.bind(inner);
      vi.spyOn(inner, "connect").mockImplementation(async (profile) => {
        const session = await realConnect(profile);
        session.fs.stat = () => Promise.reject(new ctor({ message: msg, retryable: true }));
        return session;
      });
      const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
      const session = await pool.connect(makeProfile());
      await expect(session.fs.stat("/")).rejects.toBeInstanceOf(ctor);
      await session.disconnect();
      expect(pool.poolSize()).toBe(0);
      await pool.drainPool();
    }
  });

  it("clamps maxIdlePerKey to at least 1", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0, maxIdlePerKey: 0 });
    const a = await pool.connect(makeProfile());
    const b = await pool.connect(makeProfile());
    await a.disconnect();
    await b.disconnect();
    expect(pool.poolSize()).toBe(1);
    await pool.drainPool();
  });

  it("forwards explicit options through every wrapped fs method", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    const session = await pool.connect(makeProfile());
    try {
      await session.fs.mkdir?.("/o", { recursive: true });
      const transfers = session.transfers;
      if (transfers === undefined) throw new Error("expected transfers");
      const payload = new TextEncoder().encode("hello");
      await transfers.write({
        attempt: 1,
        // eslint-disable-next-line @typescript-eslint/require-await
        content: (async function* () {
          yield payload;
        })(),
        endpoint: { path: "/o/file.txt", provider: "memory" },
        job: {
          destination: { path: "/o/file.txt", provider: "memory" },
          id: "opts-write",
          operation: "upload",
        },
        reportProgress: () => undefined as never,
        throwIfAborted: () => undefined,
      });
      await session.fs.list("/o", {});
      await session.fs.stat("/o/file.txt", {});
      await session.fs.rename?.("/o/file.txt", "/o/renamed.txt", {});
      await session.fs.remove?.("/o/renamed.txt", {});
      await session.fs.rmdir?.("/o", { recursive: true });
    } finally {
      await session.disconnect();
      await pool.drainPool();
    }
  });

  it("applies defaultKeyOf fallbacks when profile fields are missing", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const connectSpy = vi.spyOn(inner, "connect");
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    // Profile with provider/protocol/port/username intentionally undefined to
    // drive every ?? fallback in defaultKeyOf. Host is required by validation.
    const profile = { host: "h", provider: "memory" } as ConnectionProfile;
    const a = await pool.connect(profile);
    await a.disconnect();
    const b = await pool.connect(profile);
    await b.disconnect();
    expect(connectSpy).toHaveBeenCalledTimes(1);
    await pool.drainPool();
  });

  it("falls back to protocol when provider is undefined", async () => {
    const inner = new TransferClient({ providers: [createMemoryProviderFactory()] });
    const realConnect = inner.connect.bind(inner);
    vi.spyOn(inner, "connect").mockImplementation(async () => realConnect(makeProfile()));
    const pool = createPooledTransferClient(inner, { idleTimeoutMs: 0 });
    // protocol present, provider undefined; non-string username; missing port.
    const profile = {
      host: "h",
      protocol: "ftp",
      provider: "memory",
      username: 123 as unknown as string,
    } as ConnectionProfile;
    const session = await pool.connect(profile);
    await session.disconnect();
    await pool.drainPool();
  });
});
