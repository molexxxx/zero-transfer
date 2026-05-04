/**
 * SSH session channel (RFC 4254 §6).
 *
 * Manages a single "session" channel from the client side:
 *   CHANNEL_OPEN → OPEN_CONFIRMATION → CHANNEL_REQUEST (subsystem/exec) →
 *   bidirectional CHANNEL_DATA with window management → CHANNEL_EOF/CLOSE.
 *
 * Window management strategy:
 *   - Local window starts at INITIAL_WINDOW_SIZE.
 *   - When consumed bytes exceed WINDOW_REFILL_THRESHOLD, a WINDOW_ADJUST is sent.
 *   - Outbound data respects the remote window; excess is queued and flushed
 *     as the remote issues WINDOW_ADJUST messages.
 */
import { Buffer } from "node:buffer";
import { ConnectionError, ProtocolError } from "../../../errors/ZeroTransferError";
import {
  SSH_MSG_CHANNEL_CLOSE,
  SSH_MSG_CHANNEL_DATA,
  SSH_MSG_CHANNEL_EOF,
  SSH_MSG_CHANNEL_EXTENDED_DATA,
  SSH_MSG_CHANNEL_FAILURE,
  SSH_MSG_CHANNEL_OPEN_CONFIRMATION,
  SSH_MSG_CHANNEL_OPEN_FAILURE,
  SSH_MSG_CHANNEL_SUCCESS,
  SSH_MSG_CHANNEL_WINDOW_ADJUST,
  decodeSshChannelData,
  decodeSshChannelExtendedData,
  decodeSshChannelOpenConfirmation,
  decodeSshChannelOpenFailure,
  decodeSshChannelWindowAdjust,
  encodeSshChannelClose,
  encodeSshChannelData,
  encodeSshChannelEof,
  encodeSshChannelOpen,
  encodeSshChannelRequestExec,
  encodeSshChannelRequestSubsystem,
  encodeSshChannelWindowAdjust,
} from "./SshConnectionMessages";
import type { SshTransportConnection } from "../transport/SshTransportConnection";

const INITIAL_WINDOW_SIZE = 256 * 1024; // 256 KiB
const MAX_PACKET_SIZE = 32 * 1024; // 32 KiB
const WINDOW_REFILL_THRESHOLD = 64 * 1024;

// -- Channel state -------------------------------------------------------------

type ChannelPhase = "opening" | "requesting" | "open" | "closing" | "closed";

type InboundEntry =
  | { type: "data"; data: Buffer }
  | { type: "eof" }
  | { type: "close" }
  | { type: "error"; error: Error };

export interface SshSessionChannelOptions {
  /**
   * Local channel id allocated by the caller.
   * If omitted, defaults to 0 (single-channel use case).
   */
  localChannelId?: number;
}

/**
 * A single SSH session channel.
 * Not safe to share across concurrent callers; each SftpSession should own one.
 */
export class SshSessionChannel {
  private phase: ChannelPhase = "opening";

  /** Remote channel id assigned by the server in OPEN_CONFIRMATION. */
  private remoteChannelId = 0;
  /** Bytes the remote side can still receive before we must stop sending. */
  private remoteWindowRemaining = 0;
  /** Maximum packet data size the remote accepts. */
  private remoteMaxPacketSize = MAX_PACKET_SIZE;

  /** Local window: bytes we can still accept from remote. */
  private localWindowConsumed = 0;
  private localWindowSize = INITIAL_WINDOW_SIZE;

  /** Queue of inbound data for the `receiveData()` generator. */
  private readonly inboundQueue: InboundEntry[] = [];
  private waitingConsumer: (() => void) | undefined;

  /** Queue of outbound data waiting for remote window space. */
  private readonly outboundQueue: Buffer[] = [];
  /**
   * FIFO of waiters blocked on remote window credit. Each WINDOW_ADJUST wakes
   * exactly one waiter; concurrent senders must not lose wakeups.
   */
  private readonly outboundDrainedWaiters: Array<() => void> = [];
  /** Serializes sendData() calls so byte order on the wire matches call order. */
  private sendChain: Promise<void> = Promise.resolve();

  private readonly localChannelId: number;

  constructor(
    private readonly transport: SshTransportConnection,
    options: SshSessionChannelOptions = {},
  ) {
    this.localChannelId = options.localChannelId ?? 0;
  }

  // -- Lifecycle ---------------------------------------------------------------

  /**
   * Opens the channel and requests a subsystem.
   * Resolves once the server confirms both CHANNEL_OPEN and the subsystem request.
   */
  async openSubsystem(subsystemName: string): Promise<void> {
    await this.openChannel();
    await this.requestSubsystem(subsystemName);
  }

  /**
   * Opens the channel and executes a command.
   */
  async openExec(command: string): Promise<void> {
    await this.openChannel();
    await this.requestExec(command);
  }

  private async openChannel(): Promise<void> {
    this.transport.sendPayload(
      encodeSshChannelOpen({
        channelType: "session",
        initialWindowSize: INITIAL_WINDOW_SIZE,
        maxPacketSize: MAX_PACKET_SIZE,
        senderChannel: this.localChannelId,
      }),
    );

    const payload = await this.nextPayload();
    const msgType = payload[0];

    if (msgType === SSH_MSG_CHANNEL_OPEN_FAILURE) {
      const failure = decodeSshChannelOpenFailure(payload);
      throw new ConnectionError({
        details: { reason: failure.reasonCode, description: failure.description },
        message: `SSH channel open failed: ${failure.description}`,
        protocol: "sftp",
        retryable: false,
      });
    }

    if (msgType !== SSH_MSG_CHANNEL_OPEN_CONFIRMATION) {
      throw new ProtocolError({
        details: { msgType },
        message: "Expected SSH_MSG_CHANNEL_OPEN_CONFIRMATION",
        protocol: "sftp",
        retryable: false,
      });
    }

    const confirmation = decodeSshChannelOpenConfirmation(payload);
    this.remoteChannelId = confirmation.senderChannel;
    this.remoteWindowRemaining = confirmation.initialWindowSize;
    this.remoteMaxPacketSize = confirmation.maxPacketSize;
    this.phase = "requesting";
  }

  private async requestSubsystem(subsystemName: string): Promise<void> {
    this.transport.sendPayload(
      encodeSshChannelRequestSubsystem({
        recipientChannel: this.remoteChannelId,
        subsystemName,
        wantReply: true,
      }),
    );
    await this.awaitChannelRequestReply("subsystem");
  }

  private async requestExec(command: string): Promise<void> {
    this.transport.sendPayload(
      encodeSshChannelRequestExec({
        command,
        recipientChannel: this.remoteChannelId,
        wantReply: true,
      }),
    );
    await this.awaitChannelRequestReply("exec");
  }

  private async awaitChannelRequestReply(requestType: string): Promise<void> {
    const payload = await this.nextPayload();
    const msgType = payload[0];

    if (msgType === SSH_MSG_CHANNEL_SUCCESS) {
      this.phase = "open";
      return;
    }

    if (msgType === SSH_MSG_CHANNEL_FAILURE) {
      throw new ConnectionError({
        details: { requestType },
        message: `SSH channel request "${requestType}" was rejected by the server`,
        protocol: "sftp",
        retryable: false,
      });
    }

    throw new ProtocolError({
      details: { msgType },
      message: `Unexpected response to channel request "${requestType}"`,
      protocol: "sftp",
      retryable: false,
    });
  }

  // -- Send --------------------------------------------------------------------

  /**
   * Sends data on the channel. Respects the remote window; if there is no space,
   * splits the data and queues the remainder for when WINDOW_ADJUST arrives.
   *
   * Concurrent calls are serialized so wire byte order matches call order.
   */
  sendData(data: Uint8Array): Promise<void> {
    const next = this.sendChain.then(() => this.sendDataLocked(data));
    // Keep the chain alive even if a single send rejects, so subsequent sends
    // are not blocked on a poisoned promise.
    this.sendChain = next.catch(() => undefined);
    return next;
  }

  private async sendDataLocked(data: Uint8Array): Promise<void> {
    if (this.phase !== "open") {
      throw new ProtocolError({
        message: "Cannot send data on a channel that is not open",
        protocol: "sftp",
        retryable: false,
      });
    }

    let offset = 0;
    while (offset < data.length) {
      if (this.remoteWindowRemaining <= 0) {
        // Backpressure: wait for remote to issue WINDOW_ADJUST.
        await new Promise<void>((resolve) => {
          this.outboundDrainedWaiters.push(resolve);
        });
        continue;
      }

      const chunkSize = Math.min(
        data.length - offset,
        this.remoteWindowRemaining,
        this.remoteMaxPacketSize,
      );
      const chunk = Buffer.from(data.subarray(offset, offset + chunkSize));
      this.transport.sendPayload(
        encodeSshChannelData({ data: chunk, recipientChannel: this.remoteChannelId }),
      );
      this.remoteWindowRemaining -= chunkSize;
      offset += chunkSize;
    }
  }

  // -- Receive -----------------------------------------------------------------

  /**
   * Async generator that yields raw data buffers from the channel.
   * Returns (done) when the channel receives EOF or CLOSE.
   */
  async *receiveData(): AsyncGenerator<Buffer, void, undefined> {
    while (true) {
      const entry = await this.dequeueInbound();
      if (entry.type === "error") throw entry.error;
      if (entry.type === "eof" || entry.type === "close") return;
      yield entry.data;
    }
  }

  // -- Close -------------------------------------------------------------------

  /**
   * Sends EOF and CLOSE.  Should be called when the client is done sending.
   */
  close(): void {
    if (this.phase === "closed" || this.phase === "closing") return;
    this.phase = "closing";
    this.transport.sendPayload(encodeSshChannelEof(this.remoteChannelId));
    this.transport.sendPayload(encodeSshChannelClose(this.remoteChannelId));
  }

  // -- Dispatch (called by SshConnectionManager) -----------------------------

  /**
   * Feed an inbound transport payload to this channel.
   * Called by the channel multiplexer (`SshConnectionManager`).
   */
  dispatch(payload: Buffer): void {
    const msgType = payload[0];

    switch (msgType) {
      case SSH_MSG_CHANNEL_DATA: {
        const msg = decodeSshChannelData(payload);
        this.consumeLocalWindow(msg.data.length);
        this.enqueueInbound({ type: "data", data: msg.data });
        break;
      }

      case SSH_MSG_CHANNEL_EXTENDED_DATA: {
        // Consume window credit; we discard STDERR data (SFTP doesn't use it).
        const msg = decodeSshChannelExtendedData(payload);
        this.consumeLocalWindow(msg.data.length);
        break;
      }

      case SSH_MSG_CHANNEL_WINDOW_ADJUST: {
        const msg = decodeSshChannelWindowAdjust(payload);
        this.remoteWindowRemaining += msg.bytesToAdd;
        // Wake all waiters; sendDataLocked re-checks the window in its loop.
        const waiters = this.outboundDrainedWaiters.splice(0);
        for (const cb of waiters) cb();
        break;
      }

      case SSH_MSG_CHANNEL_EOF: {
        this.enqueueInbound({ type: "eof" });
        break;
      }

      case SSH_MSG_CHANNEL_CLOSE: {
        this.phase = "closed";
        this.enqueueInbound({ type: "close" });
        // Wake any waiters blocked on remote window credit so they can observe
        // the channel is no longer open and reject.
        const waiters = this.outboundDrainedWaiters.splice(0);
        for (const cb of waiters) cb();
        break;
      }

      default:
        // Unknown or ignored channel message types.
        break;
    }
  }

  dispatchError(error: Error): void {
    this.enqueueInbound({ type: "error", error });
    // Unblock any senders so they observe the failure rather than hanging.
    const waiters = this.outboundDrainedWaiters.splice(0);
    for (const cb of waiters) cb();
  }

  // -- Private helpers ------------------------------------------------------

  private consumeLocalWindow(bytes: number): void {
    this.localWindowConsumed += bytes;
    if (this.localWindowConsumed >= WINDOW_REFILL_THRESHOLD) {
      const bytesToAdd = this.localWindowConsumed;
      this.localWindowConsumed = 0;
      this.transport.sendPayload(
        encodeSshChannelWindowAdjust({
          bytesToAdd,
          recipientChannel: this.remoteChannelId,
        }),
      );
    }
  }

  private enqueueInbound(entry: InboundEntry): void {
    this.inboundQueue.push(entry);
    if (this.waitingConsumer !== undefined) {
      const cb = this.waitingConsumer;
      this.waitingConsumer = undefined;
      cb();
    }
  }

  private dequeueInbound(): Promise<InboundEntry> {
    if (this.inboundQueue.length > 0) {
      return Promise.resolve(this.inboundQueue.shift()!);
    }
    return new Promise<InboundEntry>((resolve) => {
      this.waitingConsumer = () => {
        resolve(this.inboundQueue.shift()!);
      };
    });
  }

  /** Pull the next payload from the transport (used during channel setup only). */
  private async nextPayload(): Promise<Buffer> {
    const result = await this.transport.receivePayloads().next();
    if (result.done === true) {
      throw new ConnectionError({
        message: "SSH connection closed during channel setup",
        protocol: "sftp",
        retryable: false,
      });
    }
    return result.value;
  }
}
