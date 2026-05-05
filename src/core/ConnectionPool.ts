/**
 * Connection pooling for {@link TransferClient}.
 *
 * Wraps an existing {@link TransferClient} and reuses idle provider sessions
 * keyed by `(provider, host, port, username)` so successive transfers to the
 * same endpoint avoid the cost of repeated TCP/TLS handshakes, FTP login
 * round-trips, SFTP key exchange, and similar per-session setup work. This is
 * an opt-in wrapper: workloads that prefer fresh sessions per call should
 * keep using `TransferClient` directly.
 *
 * Pooling preserves the public {@link TransferSession} surface - callers
 * still call `disconnect()` when finished, but rather than tearing down the
 * underlying transport the wrapper marks the session idle and returns it to
 * the pool for reuse. Idle sessions are evicted automatically after
 * {@link ConnectionPoolOptions.idleTimeoutMs} milliseconds, and the pool can
 * be drained explicitly via the returned {@link PooledTransferClient.drainPool}
 * helper.
 *
 * Sessions that surface {@link ConnectionError}, {@link TimeoutError}, or
 * {@link ProtocolError} during use are considered "tainted" and discarded
 * instead of returned to the pool, since the underlying transport may be in
 * an inconsistent state. Application errors such as
 * {@link PathNotFoundError} or {@link PermissionDeniedError} do not taint
 * the session.
 *
 * @module core/ConnectionPool
 */
import { ConnectionError, ProtocolError, TimeoutError } from "../errors/ZeroTransferError";
import type { ProviderTransferOperations } from "../providers/ProviderTransferOperations";
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { ConnectionProfile } from "../types/public";
import type { CapabilitySet } from "./CapabilitySet";
import type { ProviderId } from "./ProviderId";
import type { TransferClient } from "./TransferClient";
import type { TransferSession } from "./TransferSession";

/** Options for {@link createPooledTransferClient}. */
export interface ConnectionPoolOptions {
  /**
   * Maximum number of *idle* sessions retained per pool key.
   *
   * Active leases are not counted against this limit - the cap only applies
   * to sessions waiting in the pool. When more than `maxIdlePerKey` sessions
   * become idle simultaneously, the oldest ones are disconnected. Defaults
   * to `4`.
   */
  maxIdlePerKey?: number;
  /**
   * How long an idle session may sit unused before it is automatically
   * disconnected. Defaults to `60_000` ms. Set to `0` to disable the timer
   * (idle sessions persist until `drainPool()` is called).
   */
  idleTimeoutMs?: number;
  /**
   * Custom pool key derivation. Receives the resolved
   * {@link ConnectionProfile} (after TransferClient validation) and must
   * return a string. Sessions with matching keys are pooled together; never
   * include secrets in the key.
   *
   * The default derives the key from `provider`, `host`, `port`, and
   * `username`.
   */
  keyOf?: (profile: ConnectionProfile) => string;
}

/**
 * Pool-aware {@link TransferClient} returned by
 * {@link createPooledTransferClient}.
 */
export interface PooledTransferClient {
  /** Opens (or leases) a pooled provider session. */
  connect(profile: ConnectionProfile): Promise<TransferSession>;
  /** Inspects the registered providers (delegated to the underlying client). */
  hasProvider(providerId: ProviderId): boolean;
  /** Returns the registered capability snapshots (delegated). */
  getCapabilities(): CapabilitySet[];
  /** Returns a specific capability snapshot (delegated). */
  getCapabilities(providerId: ProviderId): CapabilitySet;
  /**
   * Disconnects every idle session and prevents further pooling. After
   * `drainPool()` resolves, subsequent `connect()` calls still work but
   * always create fresh sessions (and never return them to the pool).
   */
  drainPool(): Promise<void>;
  /** Returns the number of idle sessions currently held in the pool. */
  poolSize(): number;
}

interface PoolEntry {
  session: TransferSession;
  /** Timer that disconnects this entry after `idleTimeoutMs`. */
  idleTimer?: ReturnType<typeof setTimeout>;
}

interface InternalState {
  drained: boolean;
  /** Idle sessions keyed by pool key. */
  idle: Map<string, PoolEntry[]>;
}

const DEFAULT_MAX_IDLE_PER_KEY = 4;
const DEFAULT_IDLE_TIMEOUT_MS = 60_000;

/**
 * Wraps a {@link TransferClient} with connection pooling.
 *
 * @param inner - Underlying client used to create real provider sessions.
 * @param options - Pool sizing, eviction, and key-derivation overrides.
 * @returns A {@link PooledTransferClient} that reuses idle sessions.
 */
export function createPooledTransferClient(
  inner: TransferClient,
  options: ConnectionPoolOptions = {},
): PooledTransferClient {
  const maxIdlePerKey = Math.max(1, options.maxIdlePerKey ?? DEFAULT_MAX_IDLE_PER_KEY);
  const idleTimeoutMs = Math.max(0, options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS);
  const keyOf = options.keyOf ?? defaultKeyOf;

  const state: InternalState = {
    drained: false,
    idle: new Map(),
  };

  const release = (key: string, session: TransferSession, tainted: boolean): Promise<void> => {
    if (tainted || state.drained) {
      return safelyDisconnect(session);
    }

    let bucket = state.idle.get(key);
    if (bucket === undefined) {
      bucket = [];
      state.idle.set(key, bucket);
    }

    const entry: PoolEntry = { session };
    if (idleTimeoutMs > 0) {
      entry.idleTimer = setTimeout(() => {
        evictEntry(state, key, entry);
      }, idleTimeoutMs);
      // Avoid keeping the Node.js event loop alive solely for idle pool
      // entries (e.g. in CLI tools).
      const timer = entry.idleTimer as { unref?: () => void } | undefined;
      if (timer !== undefined && typeof timer.unref === "function") {
        timer.unref();
      }
    }

    bucket.push(entry);

    // Trim the oldest entries when the bucket exceeds the cap.
    while (bucket.length > maxIdlePerKey) {
      const dropped = bucket.shift();
      if (dropped !== undefined) {
        clearEntryTimer(dropped);
        void safelyDisconnect(dropped.session);
      }
    }
    return Promise.resolve();
  };

  const acquire = async (
    profile: ConnectionProfile,
  ): Promise<{ session: TransferSession; key: string }> => {
    const key = keyOf(profile);
    const bucket = state.idle.get(key);
    if (bucket !== undefined && bucket.length > 0) {
      const entry = bucket.pop();
      if (entry !== undefined) {
        clearEntryTimer(entry);
        if (bucket.length === 0) state.idle.delete(key);
        return { key, session: entry.session };
      }
    }
    const session = await inner.connect(profile);
    return { key, session };
  };

  return {
    connect: async (profile) => {
      const { key, session } = await acquire(profile);
      return wrapPooledSession(session, key, release);
    },
    drainPool: async () => {
      state.drained = true;
      const entries: PoolEntry[] = [];
      for (const bucket of state.idle.values()) {
        for (const entry of bucket) {
          clearEntryTimer(entry);
          entries.push(entry);
        }
      }
      state.idle.clear();
      await Promise.all(entries.map((entry) => safelyDisconnect(entry.session)));
    },
    getCapabilities: ((providerId?: ProviderId): CapabilitySet | CapabilitySet[] => {
      if (providerId === undefined) return inner.getCapabilities();
      return inner.getCapabilities(providerId);
    }) as PooledTransferClient["getCapabilities"],
    hasProvider: (providerId) => inner.hasProvider(providerId),
    poolSize: () => {
      let total = 0;
      for (const bucket of state.idle.values()) total += bucket.length;
      return total;
    },
  };
}

/** Default pool key - never includes secrets. */
function defaultKeyOf(profile: ConnectionProfile): string {
  const provider = profile.provider ?? profile.protocol ?? "unknown";
  const host = profile.host ?? "";
  const port = profile.port ?? "";
  const username = typeof profile.username === "string" ? profile.username : "";
  return `${provider}|${host}|${String(port)}|${username}`;
}

function evictEntry(state: InternalState, key: string, entry: PoolEntry): void {
  const bucket = state.idle.get(key);
  if (bucket === undefined) return;
  const index = bucket.indexOf(entry);
  if (index < 0) return;
  bucket.splice(index, 1);
  if (bucket.length === 0) state.idle.delete(key);
  clearEntryTimer(entry);
  void safelyDisconnect(entry.session);
}

function clearEntryTimer(entry: PoolEntry): void {
  if (entry.idleTimer !== undefined) {
    clearTimeout(entry.idleTimer);
    delete entry.idleTimer;
  }
}

async function safelyDisconnect(session: TransferSession): Promise<void> {
  try {
    await session.disconnect();
  } catch {
    // Pool teardown errors are not actionable; swallow them.
  }
}

/** Errors that indicate the underlying transport may be in a bad state. */
function isTaintingError(error: unknown): boolean {
  return (
    error instanceof ConnectionError ||
    error instanceof TimeoutError ||
    error instanceof ProtocolError
  );
}

/**
 * Wraps a real {@link TransferSession} so that:
 *   - operation errors that indicate transport corruption taint the lease,
 *   - `disconnect()` returns the (untainted) session to the pool,
 *   - subsequent calls on a disconnected lease throw rather than racing.
 */
function wrapPooledSession(
  session: TransferSession,
  key: string,
  release: (key: string, session: TransferSession, tainted: boolean) => Promise<void>,
): TransferSession {
  let tainted = false;
  let released = false;

  const guard = <T>(fn: () => Promise<T>): Promise<T> => {
    let promise: Promise<T>;
    try {
      promise = fn();
    } catch (error) {
      if (isTaintingError(error)) tainted = true;
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
    return promise.catch((error: unknown) => {
      if (isTaintingError(error)) tainted = true;
      throw error;
    });
  };

  const fs = wrapFs(session.fs, guard);
  const transfers =
    session.transfers === undefined ? undefined : wrapTransfers(session.transfers, guard);

  const wrapped: TransferSession = {
    capabilities: session.capabilities,
    disconnect: async () => {
      if (released) return;
      released = true;
      await release(key, session, tainted);
    },
    fs,
    provider: session.provider,
    ...(transfers !== undefined ? { transfers } : {}),
  };

  if (typeof session.raw === "function") {
    const rawFn = session.raw.bind(session);
    wrapped.raw = () => rawFn();
  }

  return wrapped;
}

function wrapFs(
  fs: RemoteFileSystem,
  guard: <T>(fn: () => Promise<T>) => Promise<T>,
): RemoteFileSystem {
  const wrapped: RemoteFileSystem = {
    list: (path, options) =>
      guard(() => (options !== undefined ? fs.list(path, options) : fs.list(path))),
    stat: (path, options) =>
      guard(() => (options !== undefined ? fs.stat(path, options) : fs.stat(path))),
  };
  if (typeof fs.remove === "function") {
    const remove = fs.remove.bind(fs);
    wrapped.remove = (path, options) =>
      guard(() => (options !== undefined ? remove(path, options) : remove(path)));
  }
  if (typeof fs.rename === "function") {
    const rename = fs.rename.bind(fs);
    wrapped.rename = (from, to, options) =>
      guard(() => (options !== undefined ? rename(from, to, options) : rename(from, to)));
  }
  if (typeof fs.mkdir === "function") {
    const mkdir = fs.mkdir.bind(fs);
    wrapped.mkdir = (path, options) =>
      guard(() => (options !== undefined ? mkdir(path, options) : mkdir(path)));
  }
  if (typeof fs.rmdir === "function") {
    const rmdir = fs.rmdir.bind(fs);
    wrapped.rmdir = (path, options) =>
      guard(() => (options !== undefined ? rmdir(path, options) : rmdir(path)));
  }
  return wrapped;
}

function wrapTransfers(
  transfers: ProviderTransferOperations,
  guard: <T>(fn: () => Promise<T>) => Promise<T>,
): ProviderTransferOperations {
  return {
    read: (request) => guard(() => Promise.resolve(transfers.read(request))),
    write: (request) => guard(() => Promise.resolve(transfers.write(request))),
  };
}
