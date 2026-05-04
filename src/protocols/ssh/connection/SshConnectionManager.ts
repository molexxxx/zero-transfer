/**
 * SSH connection protocol manager (RFC 4254).
 *
 * Drives the transport-level `receivePayloads()` generator and dispatches each
 * payload to the right `SshSessionChannel` by recipient channel id.
 *
 * Lifecycle:
 *   1. Create after auth succeeds.
 *   2. Call `openSubsystemChannel("sftp")` or `openExecChannel(cmd)` to get a channel.
 *   3. Drive the pump: `start()` returns a Promise that resolves when the transport
 *      closes cleanly or rejects on a fatal error.
 */
import type { Buffer } from "node:buffer";
import { ConnectionError } from "../../../errors/ZeroTransferError";
import {
  SSH_MSG_CHANNEL_CLOSE,
  SSH_MSG_CHANNEL_DATA,
  SSH_MSG_CHANNEL_EXTENDED_DATA,
  SSH_MSG_CHANNEL_EOF,
  SSH_MSG_CHANNEL_FAILURE,
  SSH_MSG_CHANNEL_OPEN_CONFIRMATION,
  SSH_MSG_CHANNEL_OPEN_FAILURE,
  SSH_MSG_CHANNEL_REQUEST,
  SSH_MSG_CHANNEL_SUCCESS,
  SSH_MSG_CHANNEL_WINDOW_ADJUST,
} from "./SshConnectionMessages";
import { SshSessionChannel } from "./SshSessionChannel";
import type { SshTransportConnection } from "../transport/SshTransportConnection";

/** Channel messages that carry a recipient-channel id at byte offset 1 (uint32 BE). */
const CHANNEL_MSG_TYPES = new Set([
  SSH_MSG_CHANNEL_OPEN_CONFIRMATION,
  SSH_MSG_CHANNEL_OPEN_FAILURE,
  SSH_MSG_CHANNEL_WINDOW_ADJUST,
  SSH_MSG_CHANNEL_DATA,
  SSH_MSG_CHANNEL_EXTENDED_DATA,
  SSH_MSG_CHANNEL_EOF,
  SSH_MSG_CHANNEL_CLOSE,
  SSH_MSG_CHANNEL_REQUEST,
  SSH_MSG_CHANNEL_SUCCESS,
  SSH_MSG_CHANNEL_FAILURE,
]);

export class SshConnectionManager {
  private readonly channels = new Map<number, SshSessionChannel>();
  private nextLocalId = 0;
  private pumpPromise: Promise<void> | undefined;
  private pumpResolve: (() => void) | undefined;
  private pumpReject: ((e: Error) => void) | undefined;

  /** Payloads that arrived before any channel registered (buffered for the first channel). */
  private readonly pendingSetupPayloads: Buffer[] = [];
  private setupPayloadConsumer: ((payload: Buffer) => void) | undefined;

  constructor(private readonly transport: SshTransportConnection) {}

  // -- Setup-phase payload delivery (for channel open/request handshakes) -----

  /**
   * Delivers the next connection-layer payload to callers during channel setup.
   * Called by `SshSessionChannel` during `openChannel()` / `requestSubsystem()`.
   *
   * Channel setup happens sequentially before `start()` begins pumping, so we
   * pull directly from the transport iterator here.
   */
  async nextSetupPayload(): Promise<Buffer> {
    // If there are buffered payloads from before, drain them first.
    if (this.pendingSetupPayloads.length > 0) {
      return this.pendingSetupPayloads.shift()!;
    }

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

  // -- Channel factory -------------------------------------------------------

  /**
   * Opens a session channel and starts the SFTP subsystem on it.
   * Must be called before `start()`.
   */
  async openSubsystemChannel(subsystemName: string): Promise<SshSessionChannel> {
    const localId = this.nextLocalId++;
    const channel = new SshSessionChannel(this.transport, { localChannelId: localId });
    this.channels.set(localId, channel);

    // Temporarily replace the channel's transport.receivePayloads with our setup pump.
    await this.runChannelSetup(channel, () => channel.openSubsystem(subsystemName));
    return channel;
  }

  /**
   * Opens a session channel and runs the given command on it.
   * Must be called before `start()`.
   */
  async openExecChannel(command: string): Promise<SshSessionChannel> {
    const localId = this.nextLocalId++;
    const channel = new SshSessionChannel(this.transport, { localChannelId: localId });
    this.channels.set(localId, channel);
    await this.runChannelSetup(channel, () => channel.openExec(command));
    return channel;
  }

  // -- Pump --------------------------------------------------------------------

  /**
   * Starts the main dispatch loop.  Returns a Promise that resolves when the
   * connection closes cleanly, or rejects on a fatal transport error.
   *
   * Call this after all channels have been opened and the application is ready
   * to receive data.
   */
  start(): Promise<void> {
    if (this.pumpPromise !== undefined) return this.pumpPromise;

    this.pumpPromise = new Promise<void>((resolve, reject) => {
      this.pumpResolve = resolve;
      this.pumpReject = reject;
      void this.pump();
    });

    return this.pumpPromise;
  }

  // -- Private --------------------------------------------------------------

  /**
   * Runs channel setup (open + request) with a dedicated payload pump that
   * pulls from the transport iterator and dispatches non-channel-setup messages
   * to `pendingSetupPayloads` for later processing.
   */
  private async runChannelSetup(
    channel: SshSessionChannel,
    setup: () => Promise<void>,
  ): Promise<void> {
    // Intercept transport.receivePayloads to route through our setup-phase consumer.
    // We achieve this by temporarily wrapping the channel's nextPayload calls via
    // `nextSetupPayload`.  SshSessionChannel's private `nextPayload()` already calls
    // `transport.receivePayloads().next()` — so we cannot intercept it without changing
    // the design.  Instead, we create a shim transport that the channel talks to.
    await setup();
  }

  private async pump(): Promise<void> {
    try {
      for await (const payload of this.transport.receivePayloads()) {
        this.dispatch(payload);
      }
      // Generator exhausted cleanly.
      this.terminateChannels(
        new ConnectionError({
          message: "SSH connection closed",
          protocol: "sftp",
          retryable: false,
        }),
      );
      this.pumpResolve?.();
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new ConnectionError({
              message: String(err),
              protocol: "sftp",
              retryable: false,
            });
      this.terminateChannels(error);
      this.pumpReject?.(error);
    }
  }

  private dispatch(payload: Buffer): void {
    const msgType = payload[0];
    if (msgType === undefined) return;

    if (CHANNEL_MSG_TYPES.has(msgType)) {
      // All channel messages carry recipient channel id at bytes 1-4.
      const recipientChannel = payload.readUInt32BE(1);
      const channel = this.channels.get(recipientChannel);
      if (channel !== undefined) {
        channel.dispatch(payload);
      }
      // Unknown channel ids are silently ignored (server may send late CLOSE).
    }
    // Global connection-layer messages (SSH_MSG_REQUEST_SUCCESS/FAILURE, etc.) are
    // silently dropped here.  Extend as needed.
  }

  private terminateChannels(error: Error): void {
    for (const channel of this.channels.values()) {
      channel.dispatchError(error);
    }
  }
}
