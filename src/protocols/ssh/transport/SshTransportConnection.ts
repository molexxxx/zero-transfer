import { Buffer } from "node:buffer";
import type { Socket } from "node:net";
import { ConnectionError, ProtocolError, TimeoutError } from "../../../errors/ZeroTransferError";
import { SshDataReader } from "../binary/SshDataReader";
import { SshDataWriter } from "../binary/SshDataWriter";
import type { SshAlgorithmPreferences } from "./SshAlgorithmNegotiation";
import { SshTransportHandshake, type SshTransportHandshakeResult } from "./SshTransportHandshake";
import type {
  SshTransportPacketProtector,
  SshTransportPacketUnprotector,
} from "./SshTransportProtection";
import { createSshTransportProtectionContext } from "./SshTransportProtection";

/** Standard SSH disconnect reason codes (RFC 4253 §11.1). */
export const SshDisconnectReason = {
  HOST_NOT_ALLOWED_TO_CONNECT: 1,
  PROTOCOL_ERROR: 2,
  KEY_EXCHANGE_FAILED: 3,
  MAC_ERROR: 5,
  COMPRESSION_ERROR: 6,
  SERVICE_NOT_AVAILABLE: 7,
  PROTOCOL_VERSION_NOT_SUPPORTED: 8,
  HOST_KEY_NOT_VERIFIABLE: 9,
  CONNECTION_LOST: 10,
  BY_APPLICATION: 11,
  TOO_MANY_CONNECTIONS: 12,
  AUTH_CANCELLED_BY_USER: 13,
  NO_MORE_AUTH_METHODS: 14,
  ILLEGAL_USER_NAME: 15,
} as const;

export type SshDisconnectReason = (typeof SshDisconnectReason)[keyof typeof SshDisconnectReason];

const MSG_DISCONNECT = 1;
const MSG_IGNORE = 2;
const MSG_DEBUG = 4;

export interface SshTransportConnectionOptions {
  /** AbortSignal that cancels the in-flight `connect()` call and tears down the socket. */
  abortSignal?: AbortSignal;
  /** Algorithm preference overrides. Defaults to the library defaults. */
  algorithms?: SshAlgorithmPreferences;
  /** SSH software version string embedded in the identification line. */
  clientSoftwareVersion?: string;
  /**
   * Hard cap (milliseconds) on the SSH identification + key exchange + first
   * NEWKEYS handshake. If exceeded the socket is destroyed and `connect()`
   * rejects with a `TimeoutError`. Has no effect once `connect()` resolves.
   */
  handshakeTimeoutMs?: number;
  /**
   * If set, sends a `SSH_MSG_IGNORE` packet every `keepaliveIntervalMs`
   * milliseconds while the transport is connected and idle. This prevents
   * stateful NAT / firewall devices from dropping long-lived idle sessions
   * (e.g. between batches in a transfer queue). The timer is reset on every
   * outbound payload, so active transfers do not generate extra traffic.
   */
  keepaliveIntervalMs?: number;
  /**
   * Synchronous host-key policy hook invoked after the signature on the SSH
   * exchange hash is verified. Throw to reject the server's identity.
   */
  verifyHostKey?: (input: {
    hostKeyBlob: Buffer;
    hostKeySha256: Buffer;
    algorithmName: string;
  }) => void;
}

type InboundQueueEntry =
  | { type: "payload"; payload: Buffer }
  | { type: "error"; error: Error }
  | { type: "end" };

/**
 * Live SSH transport connection over a TCP socket.
 *
 * Runs the SSH identification exchange and key exchange handshake on the supplied socket,
 * then provides an encrypted packet send/receive interface for higher-level SSH layers
 * (authentication, connection, SFTP subsystem).
 *
 * Usage:
 * ```ts
 * const conn = new SshTransportConnection();
 * const result = await conn.connect(socket);        // runs handshake
 * conn.sendPayload(payload);                        // post-NEWKEYS send
 * for await (const payload of conn.receivePayloads()) { ... }
 * conn.disconnect();
 * ```
 */
export class SshTransportConnection {
  private connected = false;
  private disposed = false;
  private protector: SshTransportPacketProtector | undefined;
  private unprotector: SshTransportPacketUnprotector | undefined;
  private socket: Socket | undefined;
  private keepaliveTimer: ReturnType<typeof setInterval> | undefined;

  private readonly inboundQueue: InboundQueueEntry[] = [];
  /**
   * FIFO of waiters when the queue is empty. Multiple iterators may suspend on
   * the same transport (auth session, channel setup, connection-manager pump);
   * each receives exactly one entry in arrival order. A single-slot field would
   * lose wakeups when a second consumer suspends before the first is resolved.
   */
  private readonly waitingConsumers: Array<(entry: InboundQueueEntry) => void> = [];

  constructor(private readonly options: SshTransportConnectionOptions = {}) {}

  /**
   * Runs the SSH handshake on a TCP-connected socket.
   * Resolves when NEWKEYS completes and the transport is ready for encrypted messages.
   * Rejects on socket error, abort, or protocol failure.
   */
  connect(socket: Socket): Promise<SshTransportHandshakeResult> {
    if (this.connected || this.socket !== undefined) {
      throw new ProtocolError({
        message: "SshTransportConnection.connect() called more than once",
        protocol: "sftp",
        retryable: false,
      });
    }

    this.socket = socket;

    const handshake = new SshTransportHandshake({
      ...(this.options.algorithms === undefined ? {} : { algorithms: this.options.algorithms }),
      ...(this.options.clientSoftwareVersion === undefined
        ? {}
        : { clientSoftwareVersion: this.options.clientSoftwareVersion }),
      ...(this.options.verifyHostKey === undefined
        ? {}
        : { verifyHostKey: this.options.verifyHostKey }),
    });

    return new Promise<SshTransportHandshakeResult>((resolve, reject) => {
      const { abortSignal, handshakeTimeoutMs } = this.options;
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

      // Declare all handlers before any early-return path so const bindings are
      // never in the temporal dead zone when cleanup() is called.
      const onError = (err: Error): void => {
        cleanup();
        reject(
          new ConnectionError({
            message: `SSH socket error during handshake: ${err.message}`,
            protocol: "sftp",
            retryable: false,
          }),
        );
      };

      const onClose = (): void => {
        cleanup();
        reject(
          new ConnectionError({
            message: "SSH socket closed before handshake completed",
            protocol: "sftp",
            retryable: false,
          }),
        );
      };

      const onAbort = (): void => {
        cleanup();
        socket.destroy();
        reject(
          new ConnectionError({
            message: "SSH connection aborted before handshake completed",
            protocol: "sftp",
            retryable: false,
          }),
        );
      };

      const onTimeout = (): void => {
        cleanup();
        socket.destroy();
        reject(
          new TimeoutError({
            details: { handshakeTimeoutMs },
            message: `SSH handshake did not complete within ${handshakeTimeoutMs}ms`,
            protocol: "sftp",
            retryable: true,
          }),
        );
      };

      function cleanup(): void {
        if (timeoutHandle !== undefined) {
          clearTimeout(timeoutHandle);
          timeoutHandle = undefined;
        }
        abortSignal?.removeEventListener("abort", onAbort);
        socket.off("error", onError);
        socket.off("close", onClose);
      }

      // If the signal is already aborted, reject immediately before registering
      // any listeners (nothing to clean up yet in that case).
      if (abortSignal?.aborted) {
        socket.destroy();
        reject(
          new ConnectionError({
            message: "SSH connection aborted before handshake completed",
            protocol: "sftp",
            retryable: false,
          }),
        );
        return;
      }

      abortSignal?.addEventListener("abort", onAbort, { once: true });
      socket.on("error", onError);
      socket.on("close", onClose);

      if (handshakeTimeoutMs !== undefined && handshakeTimeoutMs > 0) {
        timeoutHandle = setTimeout(onTimeout, handshakeTimeoutMs);
      }

      const handshakeDataHandler = (chunk: Buffer): void => {
        let handshakeResult: SshTransportHandshakeResult | undefined;
        try {
          const { outbound, result } = handshake.pushServerBytes(chunk);
          for (const outbuf of outbound) {
            socket.write(outbuf);
          }
          handshakeResult = result;
        } catch (err) {
          cleanup();
          socket.off("data", handshakeDataHandler);
          socket.destroy();
          reject(
            err instanceof Error
              ? err
              : new ProtocolError({
                  message: "SSH handshake failed",
                  protocol: "sftp",
                  retryable: false,
                }),
          );
          return;
        }

        if (handshakeResult !== undefined) {
          cleanup();
          socket.off("data", handshakeDataHandler);

          let protection;
          try {
            protection = createSshTransportProtectionContext({
              keys: {
                clientToServer: handshakeResult.keyExchange.transportKeys.clientToServer,
                serverToClient: handshakeResult.keyExchange.transportKeys.serverToClient,
              },
              negotiatedAlgorithms: handshakeResult.negotiatedAlgorithms,
              // RFC 4253 §6.4: sequence numbers are never reset across NEWKEYS;
              // they continue counting from the unencrypted handshake packets.
              initialInboundSequence: handshakeResult.inboundPacketCount,
              initialOutboundSequence: handshakeResult.outboundPacketCount,
            });
          } catch (err) {
            socket.destroy();
            reject(
              err instanceof Error
                ? err
                : new ProtocolError({
                    message: "SSH transport protection context creation failed",
                    protocol: "sftp",
                    retryable: false,
                  }),
            );
            return;
          }

          this.protector = protection.outbound;
          this.unprotector = protection.inbound;
          this.connected = true;

          socket.on("data", this.onEncryptedData.bind(this));
          socket.on("error", this.onSocketError.bind(this));
          socket.on("close", this.onSocketClose.bind(this));

          this.startKeepalive();

          // Feed any bytes that arrived after NEWKEYS in the same TCP segment.
          const leftover = handshake.takeRemainingBytes();
          if (leftover.length > 0) {
            this.onEncryptedData(leftover);
          }

          resolve(handshakeResult);
        }
      };

      // Send the initial client identification line, then listen for server bytes.
      socket.write(handshake.createInitialClientBytes());
      socket.on("data", handshakeDataHandler);
    });
  }

  /**
   * Sends an SSH payload over the encrypted transport.
   * The payload must start with the SSH message type byte.
   */
  sendPayload(payload: Buffer | Uint8Array): void {
    this.assertConnected();
    const frame = this.protector!.protectPayload(Buffer.from(payload));
    this.socket!.write(frame);
    // Suppress an imminent keepalive ping after real outbound traffic.
    this.resetKeepaliveTimer();
  }

  /**
   * Async generator that yields inbound SSH payloads (post-NEWKEYS).
   *
   * Transparent handling:
   * - SSH_MSG_IGNORE (2) and SSH_MSG_DEBUG (4) are silently dropped.
   * - SSH_MSG_DISCONNECT (1) from the server throws a `ConnectionError`.
   * - Socket error or close terminates the generator.
   */
  async *receivePayloads(): AsyncGenerator<Buffer> {
    this.assertConnected();
    while (true) {
      const entry = await this.dequeuePayload();
      if (entry.type === "end") return;
      if (entry.type === "error") throw entry.error;
      yield entry.payload;
    }
  }

  /**
   * Sends SSH_MSG_DISCONNECT and ends the socket.
   * Safe to call multiple times; subsequent calls are no-ops.
   */
  disconnect(
    reason: SshDisconnectReason = SshDisconnectReason.BY_APPLICATION,
    description = "",
  ): void {
    if (this.disposed || this.socket === undefined) return;
    this.disposed = true;

    this.stopKeepalive();

    if (this.connected && this.protector !== undefined) {
      try {
        const payload = new SshDataWriter()
          .writeByte(MSG_DISCONNECT)
          .writeUint32(reason)
          .writeString(description, "utf8")
          .writeString("", "utf8") // language tag (RFC 4253 §11.1)
          .toBuffer();
        this.socket.write(this.protector.protectPayload(payload));
      } catch {
        // best-effort: socket may already be closing
      }
    }

    this.socket.end();
    this.enqueueEntry({ type: "end" });
  }

  isConnected(): boolean {
    return this.connected && !this.disposed;
  }

  private onEncryptedData(chunk: Buffer): void {
    try {
      const payloads = this.unprotector!.pushBytes(chunk);
      for (const payload of payloads) {
        const msgType = payload[0];
        if (msgType === MSG_IGNORE || msgType === MSG_DEBUG) continue;
        if (msgType === MSG_DISCONNECT) {
          this.enqueueEntry({ type: "error", error: parseDisconnectPayload(payload) });
          this.socket?.destroy();
          return;
        }
        this.enqueueEntry({ type: "payload", payload });
      }
    } catch (err) {
      this.enqueueEntry({
        type: "error",
        error:
          err instanceof Error
            ? err
            : new ProtocolError({
                message: "SSH encrypted data processing error",
                protocol: "sftp",
                retryable: false,
              }),
      });
      this.socket?.destroy();
    }
  }

  private onSocketError(err: Error): void {
    this.stopKeepalive();
    if (!this.disposed) {
      this.enqueueEntry({
        type: "error",
        error: new ConnectionError({
          message: `SSH socket error: ${err.message}`,
          protocol: "sftp",
          retryable: false,
        }),
      });
    }
  }

  private onSocketClose(): void {
    this.stopKeepalive();
    if (!this.disposed) {
      this.enqueueEntry({ type: "end" });
    }
  }

  private enqueueEntry(entry: InboundQueueEntry): void {
    if (this.waitingConsumers.length > 0) {
      const resolve = this.waitingConsumers.shift()!;
      resolve(entry);
    } else {
      this.inboundQueue.push(entry);
    }
  }

  private dequeuePayload(): Promise<InboundQueueEntry> {
    if (this.inboundQueue.length > 0) {
      return Promise.resolve(this.inboundQueue.shift()!);
    }
    return new Promise((resolve) => {
      this.waitingConsumers.push(resolve);
    });
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new ProtocolError({
        message: "SshTransportConnection is not yet connected — call connect() first",
        protocol: "sftp",
        retryable: false,
      });
    }
  }

  private startKeepalive(): void {
    const intervalMs = this.options.keepaliveIntervalMs;
    if (intervalMs === undefined || intervalMs <= 0) return;
    this.keepaliveTimer = setInterval(() => this.sendKeepalivePing(), intervalMs);
    // Don't keep the Node event loop alive solely for keepalives — when the
    // process is otherwise idle the consumer should be free to exit.
    this.keepaliveTimer.unref?.();
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer !== undefined) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = undefined;
    }
  }

  private resetKeepaliveTimer(): void {
    if (this.keepaliveTimer === undefined) return;
    this.stopKeepalive();
    this.startKeepalive();
  }

  private sendKeepalivePing(): void {
    if (!this.connected || this.disposed || this.protector === undefined) return;
    try {
      // SSH_MSG_IGNORE: a benign packet the server discards, sufficient to keep
      // stateful intermediaries (NAT, firewalls) from idling out the TCP flow.
      // Body is a single empty SSH string per RFC 4253 §11.2.
      const payload = new SshDataWriter().writeByte(MSG_IGNORE).writeString("", "utf8").toBuffer();
      this.socket!.write(this.protector.protectPayload(payload));
    } catch {
      // Best-effort: a write failure here will surface via the socket error
      // handler; keepalive should never throw to the caller.
    }
  }
}

function parseDisconnectPayload(payload: Buffer): ConnectionError {
  try {
    const reader = new SshDataReader(payload.subarray(1)); // skip message type byte
    const reasonCode = reader.readUint32();
    const description = reader.readString().toString("utf8");
    return new ConnectionError({
      details: { reasonCode },
      message: `SSH_MSG_DISCONNECT: ${description.length > 0 ? description : "connection closed by server"} (code ${reasonCode})`,
      protocol: "sftp",
      retryable: false,
    });
  } catch {
    return new ConnectionError({
      message: "SSH_MSG_DISCONNECT received from server",
      protocol: "sftp",
      retryable: false,
    });
  }
}
