/**
 * Zero-dependency TCP chaos proxy for deterministic network-failure tests.
 *
 * Sits between a client and a real server (fake in-repo servers in unit
 * tests, docker protocol servers in integration tests) and injects faults
 * into either direction of the byte stream:
 *
 * - `latencyMs` - delay before each chunk is forwarded
 * - `chunkBytes` - split writes into small pieces (partial-write simulation)
 * - `throttleBytesPerSecond` - cap forwarding throughput
 * - `resetAfterBytes` - destroy both sockets once N bytes have crossed
 * - `stallAfterBytes` - silently stop forwarding after N bytes while keeping
 *   the connection open (drives stall-watchdog tests)
 *
 * Rules are resolved per accepted connection (by zero-based connection
 * index), so a test can script "first connection dies at byte N, second
 * connection is clean" and assert that a retry recovered exactly once.
 *
 * Byte-count triggers are deterministic; latency and throttle are wall-clock
 * based and intended for benchmarks and high-latency simulations rather than
 * exact assertions.
 *
 * @module test/chaos/chaosProxy
 */
import { createConnection, createServer, type Server, type Socket } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

/** Fault rules applied to one direction of a proxied connection. */
export interface ChaosDirectionRules {
  /** Delay applied before each forwarded chunk, in milliseconds. */
  latencyMs?: number;
  /** Maximum bytes forwarded per write; larger chunks are split. */
  chunkBytes?: number;
  /** Approximate forwarding throughput cap in bytes per second. */
  throttleBytesPerSecond?: number;
  /** Destroys both sockets once this many bytes have been forwarded. */
  resetAfterBytes?: number;
  /** Stops forwarding (connection stays open) once this many bytes have been forwarded. */
  stallAfterBytes?: number;
}

/** Fault rules for a single proxied connection. */
export interface ChaosConnectionRules {
  /** Rules for client-to-server bytes (requests, uploads). */
  upstream?: ChaosDirectionRules;
  /** Rules for server-to-client bytes (responses, downloads). */
  downstream?: ChaosDirectionRules;
}

/** Options accepted by {@link ChaosProxy}. */
export interface ChaosProxyOptions {
  /** Target server the proxy forwards to. */
  target: { host: string; port: number };
  /**
   * Rules applied to every connection, or a resolver invoked with the
   * zero-based connection index so tests can script different faults per
   * attempt (e.g. reset the first connection, leave the second clean).
   */
  rules?: ChaosConnectionRules | ((connectionIndex: number) => ChaosConnectionRules);
}

/** Live telemetry for one proxied connection. */
export interface ChaosConnectionStats {
  /** Zero-based index in accept order. */
  index: number;
  /** Bytes forwarded client-to-server. */
  upstreamBytes: number;
  /** Bytes forwarded server-to-client. */
  downstreamBytes: number;
  /** Whether the proxy injected a reset on this connection. */
  reset: boolean;
  /** Whether the proxy stalled this connection. */
  stalled: boolean;
}

interface TrackedConnection {
  client: Socket;
  server: Socket;
  stats: ChaosConnectionStats;
}

/**
 * TCP proxy that injects deterministic network faults between a client and a
 * real server.
 *
 * @example Kill the first connection mid-transfer, let the retry succeed
 * ```ts
 * const proxy = new ChaosProxy({
 *   target: { host: "127.0.0.1", port: serverPort },
 *   rules: (index) =>
 *     index === 0 ? { downstream: { resetAfterBytes: 8192 } } : {},
 * });
 * const port = await proxy.start();
 * // point the client at 127.0.0.1:port and assert one retry recovered
 * await proxy.stop();
 * ```
 */
export class ChaosProxy {
  private readonly options: ChaosProxyOptions;
  private readonly server: Server;
  private readonly trackedConnections: TrackedConnection[] = [];

  constructor(options: ChaosProxyOptions) {
    this.options = options;
    this.server = createServer((client) => this.handleConnection(client));
  }

  /** Starts listening on a random loopback port and returns it. */
  async start(): Promise<number> {
    await new Promise<void>((resolve) => {
      this.server.listen(0, "127.0.0.1", resolve);
    });
    return this.port;
  }

  /** Destroys open connections and closes the listener. */
  async stop(): Promise<void> {
    for (const tracked of this.trackedConnections) {
      tracked.client.destroy();
      tracked.server.destroy();
    }
    if (!this.server.listening) return;
    await new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error !== undefined) reject(error);
        else resolve();
      });
    });
  }

  /** The bound listening port. */
  get port(): number {
    const address = this.server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Chaos proxy is not listening on a TCP port");
    }
    return address.port;
  }

  /** Per-connection telemetry snapshots in accept order. */
  get connections(): ChaosConnectionStats[] {
    return this.trackedConnections.map((tracked) => ({ ...tracked.stats }));
  }

  private resolveRules(connectionIndex: number): ChaosConnectionRules {
    const rules = this.options.rules;
    if (rules === undefined) return {};
    return typeof rules === "function" ? rules(connectionIndex) : rules;
  }

  private handleConnection(client: Socket): void {
    const index = this.trackedConnections.length;
    const rules = this.resolveRules(index);
    const server = createConnection(this.options.target.port, this.options.target.host);
    const stats: ChaosConnectionStats = {
      downstreamBytes: 0,
      index,
      reset: false,
      stalled: false,
      upstreamBytes: 0,
    };
    const tracked: TrackedConnection = { client, server, stats };
    this.trackedConnections.push(tracked);

    const destroyBoth = () => {
      client.destroy();
      server.destroy();
    };

    client.on("error", destroyBoth);
    server.on("error", destroyBoth);
    client.on("close", () => server.destroy());
    // A graceful server FIN is propagated by the downstream pump's "end"
    // handler after queued forwards flush; only an abrupt server failure
    // tears the client down immediately.
    server.on("close", (hadError) => {
      if (hadError) client.destroy();
    });

    server.once("connect", () => {
      this.pump(client, server, rules.upstream ?? {}, tracked, "upstream", destroyBoth);
      this.pump(server, client, rules.downstream ?? {}, tracked, "downstream", destroyBoth);
    });
  }

  /**
   * Forwards bytes from `source` to `sink` applying one direction's rules.
   * Implemented as a manual pull loop (pause/resume) so latency, throttling,
   * chunking, and byte-exact cutoffs stay deterministic under backpressure.
   */
  private pump(
    source: Socket,
    sink: Socket,
    rules: ChaosDirectionRules,
    tracked: TrackedConnection,
    direction: "upstream" | "downstream",
    destroyBoth: () => void,
  ): void {
    let forwarding = Promise.resolve();

    source.on("data", (data: Buffer) => {
      source.pause();
      forwarding = forwarding
        .then(() => this.forwardChunk(data, sink, rules, tracked, direction, destroyBoth))
        .then((keepGoing) => {
          if (keepGoing && !source.destroyed) source.resume();
        })
        .catch(destroyBoth);
    });
    source.on("end", () => {
      void forwarding.then(() => {
        if (!sink.destroyed && !tracked.stats.stalled) sink.end();
      });
    });
  }

  /** Returns false when forwarding must stop (stall or reset triggered). */
  private async forwardChunk(
    data: Buffer,
    sink: Socket,
    rules: ChaosDirectionRules,
    tracked: TrackedConnection,
    direction: "upstream" | "downstream",
    destroyBoth: () => void,
  ): Promise<boolean> {
    const stats = tracked.stats;
    const counted = direction === "upstream" ? "upstreamBytes" : "downstreamBytes";
    const pieceSize =
      rules.chunkBytes !== undefined && rules.chunkBytes > 0 ? rules.chunkBytes : data.length;

    let offset = 0;
    while (offset < data.length) {
      if (sink.destroyed) return false;

      let piece = data.subarray(offset, Math.min(offset + pieceSize, data.length));

      // Stall: forward only the bytes below the threshold, then go silent.
      if (rules.stallAfterBytes !== undefined) {
        const remainingBudget = rules.stallAfterBytes - stats[counted];
        if (remainingBudget <= 0) {
          stats.stalled = true;
          return false;
        }
        if (piece.length > remainingBudget) piece = piece.subarray(0, remainingBudget);
      }

      // Reset: forward only the bytes below the threshold, then kill both sides.
      let resetAfterPiece = false;
      if (rules.resetAfterBytes !== undefined) {
        const remainingBudget = rules.resetAfterBytes - stats[counted];
        if (remainingBudget <= 0) {
          stats.reset = true;
          destroyBoth();
          return false;
        }
        if (piece.length >= remainingBudget) {
          piece = piece.subarray(0, remainingBudget);
          resetAfterPiece = true;
        }
      }

      if (rules.latencyMs !== undefined && rules.latencyMs > 0) {
        await sleep(rules.latencyMs);
      }
      if (rules.throttleBytesPerSecond !== undefined && rules.throttleBytesPerSecond > 0) {
        await sleep(Math.ceil((piece.length / rules.throttleBytesPerSecond) * 1000));
      }
      if (sink.destroyed) return false;

      const flushed = sink.write(piece);
      stats[counted] += piece.length;
      offset += piece.length;

      if (resetAfterPiece) {
        stats.reset = true;
        destroyBoth();
        return false;
      }
      if (!flushed) {
        await new Promise<void>((resolve) => sink.once("drain", resolve));
      }
      if (stats.stalled) return false;
    }

    return true;
  }
}
