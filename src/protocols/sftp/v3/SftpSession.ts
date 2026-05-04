/**
 * SFTP v3 client session (draft-ietf-secsh-filexfer-02).
 *
 * Provides a fully concurrent, typed API over an open SSH session channel.
 * Multiple requests can be in flight simultaneously; each is tracked by its
 * SFTP request id.  Responses are dispatched to the correct awaiter.
 *
 * Lifecycle:
 *   const channel = await connectionManager.openSubsystemChannel("sftp");
 *   const sftp = new SftpSession(channel);
 *   await sftp.init();
 *   const handle = await sftp.open("/path/to/file", SFTP_OPEN_FLAG.READ, {});
 *   const data = await sftp.read(handle, 0n, 4096);
 *   await sftp.close(handle);
 */
import { Buffer } from "node:buffer";
import { ConnectionError, ProtocolError } from "../../../errors/ZeroTransferError";
import type { SshSessionChannel } from "../../ssh/connection/SshSessionChannel";
import {
  SFTP_OPEN_FLAG,
  type SftpFileAttributes,
  type SftpNameEntry,
  type SftpVersionResponse,
  decodeSftpAttrsPayload,
  decodeSftpDataPayload,
  decodeSftpHandlePayload,
  decodeSftpNamePayload,
  decodeSftpVersion,
  encodeSftpClose,
  encodeSftpFsetstat,
  encodeSftpFstat,
  encodeSftpInit,
  encodeSftpLstat,
  encodeSftpMkdir,
  encodeSftpOpen,
  encodeSftpOpendir,
  encodeSftpRead,
  encodeSftpReaddir,
  encodeSftpReadlink,
  encodeSftpRealpath,
  encodeSftpRemove,
  encodeSftpRename,
  encodeSftpRmdir,
  encodeSftpSetstat,
  encodeSftpStat,
  encodeSftpSymlink,
  encodeSftpWrite,
} from "./SftpMessages";
import { SFTP_STATUS, decodeSftpStatusPayload, throwIfSftpError } from "./SftpStatus";
import { SFTP_PACKET_TYPE, SftpPacketFramer } from "./SftpPacket";

export type { SftpFileAttributes, SftpNameEntry, SftpVersionResponse };
export { SFTP_OPEN_FLAG };

/** Tagged response delivered to awaiters: includes packet type so callers can branch on DATA vs STATUS. */
interface SftpResponse {
  type: number;
  payload: Buffer;
}

type PendingEntry = {
  resolve: (resp: SftpResponse) => void;
  reject: (err: Error) => void;
};

export const SFTP_PROTOCOL_VERSION = 3;

export class SftpSession {
  private nextRequestId = 1;
  private readonly pending = new Map<number, PendingEntry>();
  private readonly framer = new SftpPacketFramer();
  /** Resolves on the first packet (VERSION) during init(). */
  private versionWaiter: PendingEntry | undefined;
  private serverVersion = 0;

  constructor(private readonly channel: SshSessionChannel) {}

  // -- Lifecycle -------------------------------------------------------------

  /**
   * Sends SSH_FXP_INIT and awaits SSH_FXP_VERSION.
   * Must be called once before any other operation.
   */
  async init(): Promise<SftpVersionResponse> {
    // Start the pump before sending so no bytes are lost.
    void this.pump();

    const versionPromise = new Promise<SftpResponse>((resolve, reject) => {
      this.versionWaiter = { reject, resolve };
    });

    this.sendRaw(encodeSftpInit(SFTP_PROTOCOL_VERSION));

    const resp = await versionPromise;
    if (resp.type !== SFTP_PACKET_TYPE.VERSION) {
      throw new ProtocolError({
        details: { got: resp.type },
        message: "SFTP: expected SSH_FXP_VERSION as first server packet",
        protocol: "sftp",
        retryable: false,
      });
    }

    const result = decodeSftpVersion(resp.payload);
    this.serverVersion = result.version;
    return result;
  }

  get negotiatedVersion(): number {
    return this.serverVersion;
  }

  // -- File operations -------------------------------------------------------

  /**
   * Opens a remote file. Returns an opaque handle buffer.
   */
  async open(path: string, pflags: number, attrs: SftpFileAttributes = {}): Promise<Buffer> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpOpen({ attrs, path, pflags, requestId: id }), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpHandlePayload(resp.payload).handle;
  }

  /**
   * Closes a file or directory handle.
   */
  async close(handle: Uint8Array): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpClose(id, handle), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }

  /**
   * Reads up to `length` bytes from `handle` at `offset`.
   * Returns `null` on EOF.
   */
  async read(handle: Uint8Array, offset: bigint, length: number): Promise<Buffer | null> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRead({ handle, length, offset, requestId: id }), id);
    const resp = await this.awaitResponse(id);

    if (resp.type === SFTP_PACKET_TYPE.STATUS) {
      const status = decodeSftpStatusPayload(resp.payload);
      if (status.statusCode === SFTP_STATUS.EOF) return null;
      throwIfSftpError(status);
      return null;
    }

    return decodeSftpDataPayload(resp.payload).data;
  }

  /**
   * Writes `data` to `handle` at `offset`.
   */
  async write(handle: Uint8Array, offset: bigint, data: Uint8Array): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpWrite({ data, handle, offset, requestId: id }), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }

  // -- Stat operations -------------------------------------------------------

  async stat(path: string): Promise<SftpFileAttributes> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpStat(id, path), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }

  async lstat(path: string): Promise<SftpFileAttributes> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpLstat(id, path), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }

  async fstat(handle: Uint8Array): Promise<SftpFileAttributes> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpFstat(id, handle), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }

  async setstat(path: string, attrs: SftpFileAttributes): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpSetstat(id, path, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path);
  }

  async fsetstat(handle: Uint8Array, attrs: SftpFileAttributes): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpFsetstat(id, handle, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }

  // -- Directory operations --------------------------------------------------

  async opendir(path: string): Promise<Buffer> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpOpendir(id, path), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpHandlePayload(resp.payload).handle;
  }

  /**
   * Reads one batch of directory entries.
   * Returns an empty array when the server sends SSH_FX_EOF.
   */
  async readdir(handle: Uint8Array): Promise<SftpNameEntry[]> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpReaddir(id, handle), id);
    const resp = await this.awaitResponse(id);

    if (resp.type === SFTP_PACKET_TYPE.STATUS) {
      const status = decodeSftpStatusPayload(resp.payload);
      if (status.statusCode === SFTP_STATUS.EOF) return [];
      throwIfSftpError(status);
      return [];
    }

    return decodeSftpNamePayload(resp.payload).entries;
  }

  /**
   * Convenience: opens a directory, reads all entries, and closes the handle.
   */
  async readdirAll(path: string): Promise<SftpNameEntry[]> {
    const handle = await this.opendir(path);
    const entries: SftpNameEntry[] = [];
    try {
      while (true) {
        const batch = await this.readdir(handle);
        if (batch.length === 0) break;
        entries.push(...batch);
      }
    } finally {
      await this.close(handle);
    }
    return entries;
  }

  async remove(path: string): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRemove(id, path), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path);
  }

  async mkdir(path: string, attrs: SftpFileAttributes = {}): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpMkdir(id, path, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path);
  }

  async rmdir(path: string): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRmdir(id, path), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path);
  }

  async realpath(path: string): Promise<string> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRealpath(id, path), id);
    const resp = await this.awaitResponse(id);
    const result = decodeSftpNamePayload(resp.payload);
    const first = result.entries[0];
    if (first === undefined) {
      throw new ProtocolError({
        message: "SFTP: SSH_FXP_NAME for REALPATH returned zero entries",
        protocol: "sftp",
        retryable: false,
      });
    }
    return first.filename;
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRename(id, oldPath, newPath), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), oldPath);
  }

  async readlink(path: string): Promise<string> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpReadlink(id, path), id);
    const resp = await this.awaitResponse(id);
    const result = decodeSftpNamePayload(resp.payload);
    const first = result.entries[0];
    if (first === undefined) {
      throw new ProtocolError({
        message: "SFTP: SSH_FXP_NAME for READLINK returned zero entries",
        protocol: "sftp",
        retryable: false,
      });
    }
    return first.filename;
  }

  async symlink(linkPath: string, targetPath: string): Promise<void> {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpSymlink(id, linkPath, targetPath), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), linkPath);
  }

  // -- Private: request plumbing ---------------------------------------------

  private allocRequestId(): number {
    const id = this.nextRequestId;
    this.nextRequestId = (id % 0xffff_ffff) + 1;
    return id;
  }

  /**
   * Sends raw SFTP message bytes over the channel.
   * The message encoders embed the type byte at position 0, followed by the body.
   * We prefix with a uint32 length so the remote SFTP framer can parse the frame.
   *
   * Send is asynchronous because the underlying SSH channel may apply
   * backpressure when the remote window is exhausted; the channel itself
   * serializes concurrent calls so byte ordering is preserved.
   */
  private sendRaw(encodedMessage: Buffer, requestId?: number): void {
    const frame = Buffer.allocUnsafe(4 + encodedMessage.length);
    frame.writeUInt32BE(encodedMessage.length, 0);
    encodedMessage.copy(frame, 4);
    this.channel.sendData(frame).catch((err) => {
      // Surface send-side errors to the matching awaiter (or the version waiter)
      // so callers do not hang on a failed send.
      const error =
        err instanceof Error
          ? err
          : new ConnectionError({
              message: "SFTP channel send failed",
              protocol: "sftp",
              retryable: false,
            });
      if (requestId !== undefined) {
        const entry = this.pending.get(requestId);
        if (entry !== undefined) {
          this.pending.delete(requestId);
          entry.reject(error);
          return;
        }
      }
      if (this.versionWaiter !== undefined) {
        const waiter = this.versionWaiter;
        this.versionWaiter = undefined;
        waiter.reject(error);
      }
    });
  }

  private async pump(): Promise<void> {
    const failAll = (error: Error): void => {
      if (this.versionWaiter !== undefined) {
        this.versionWaiter.reject(error);
        this.versionWaiter = undefined;
      }
      for (const { reject } of this.pending.values()) {
        reject(error);
      }
      this.pending.clear();
    };

    try {
      for await (const chunk of this.channel.receiveData()) {
        const packets = this.framer.push(chunk);
        for (const pkt of packets) {
          this.dispatchPacket(pkt.type, pkt.payload);
        }
      }
      failAll(
        new ConnectionError({
          message: "SFTP: channel closed with pending requests",
          protocol: "sftp",
          retryable: false,
        }),
      );
    } catch (err) {
      failAll(
        err instanceof Error
          ? err
          : new ConnectionError({
              message: "SFTP channel error",
              protocol: "sftp",
              retryable: false,
            }),
      );
    }
  }

  private dispatchPacket(packetType: number, payload: Buffer): void {
    // VERSION is handled by the versionWaiter set up in init().
    if (packetType === SFTP_PACKET_TYPE.VERSION) {
      if (this.versionWaiter !== undefined) {
        const waiter = this.versionWaiter;
        this.versionWaiter = undefined;
        waiter.resolve({ payload, type: packetType });
      }
      return;
    }

    // If we are still waiting for VERSION, any non-VERSION packet is a protocol error.
    if (this.versionWaiter !== undefined) {
      const waiter = this.versionWaiter;
      this.versionWaiter = undefined;
      waiter.reject(
        new ProtocolError({
          details: { got: packetType },
          message: "SFTP: expected SSH_FXP_VERSION as first server packet",
          protocol: "sftp",
          retryable: false,
        }),
      );
      return;
    }

    // All other response types carry a uint32 request-id at payload offset 0.
    if (payload.length < 4) return;
    const requestId = payload.readUInt32BE(0);

    const entry = this.pending.get(requestId);
    if (entry === undefined) return;
    this.pending.delete(requestId);
    entry.resolve({ payload, type: packetType });
  }

  private awaitResponse(requestId: number): Promise<SftpResponse> {
    return new Promise<SftpResponse>((resolve, reject) => {
      this.pending.set(requestId, { reject, resolve });
    });
  }
}
