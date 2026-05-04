import { Buffer } from "node:buffer";
import { ParseError } from "../../../errors/ZeroTransferError";

/** SFTP packet shape after SSH channel framing has been removed. */
export interface SftpPacket {
  payload: Buffer;
  type: number;
}

/** Packet type values from the SFTP v3 baseline draft. */
export const SFTP_PACKET_TYPE = {
  ATTRS: 105,
  CLOSE: 4,
  DATA: 103,
  EXTENDED: 200,
  EXTENDED_REPLY: 201,
  FSETSTAT: 10,
  FSTAT: 8,
  HANDLE: 102,
  INIT: 1,
  LSTAT: 7,
  MKDIR: 14,
  NAME: 104,
  OPEN: 3,
  OPENDIR: 11,
  READ: 5,
  READDIR: 12,
  READLINK: 19,
  REALPATH: 16,
  REMOVE: 13,
  RENAME: 18,
  RMDIR: 15,
  SETSTAT: 9,
  STAT: 17,
  STATUS: 101,
  SYMLINK: 20,
  VERSION: 2,
  WRITE: 6,
} as const;

/**
 * Encodes a single SFTP packet into the `uint32 length` + `byte type` + payload format.
 */
export function encodeSftpPacket(packet: SftpPacket): Buffer {
  if (!Number.isInteger(packet.type) || packet.type < 0 || packet.type > 0xff) {
    throw new ParseError({
      details: { type: packet.type },
      message: "SFTP packet type must be an integer in the range 0..255",
      retryable: false,
    });
  }

  const payload = Buffer.from(packet.payload);
  const frame = Buffer.allocUnsafe(4 + 1 + payload.length);
  frame.writeUInt32BE(1 + payload.length, 0);
  frame.writeUInt8(packet.type, 4);
  payload.copy(frame, 5);
  return frame;
}

/**
 * Decodes a full SFTP frame into type and payload.
 */
export function decodeSftpPacket(frame: Uint8Array): SftpPacket {
  const bytes = Buffer.from(frame);

  if (bytes.length < 5) {
    throw new ParseError({
      details: { length: bytes.length },
      message: "SFTP frame must be at least 5 bytes",
      retryable: false,
    });
  }

  const expectedLength = bytes.readUInt32BE(0);
  const actualLength = bytes.length - 4;

  if (expectedLength !== actualLength) {
    throw new ParseError({
      details: { actualLength, expectedLength },
      message: "SFTP frame length prefix does not match packet size",
      retryable: false,
    });
  }

  return {
    payload: bytes.subarray(5),
    type: bytes.readUInt8(4),
  };
}

/**
 * Streaming parser for SFTP frames from arbitrary TCP chunk boundaries.
 */
export class SftpPacketFramer {
  private pending = Buffer.alloc(0);

  push(chunk: Uint8Array): SftpPacket[] {
    this.pending = Buffer.concat([this.pending, Buffer.from(chunk)]);
    const packets: SftpPacket[] = [];

    while (this.pending.length >= 4) {
      const bodyLength = this.pending.readUInt32BE(0);
      const frameLength = 4 + bodyLength;

      if (this.pending.length < frameLength) {
        break;
      }

      const frame = this.pending.subarray(0, frameLength);
      packets.push(decodeSftpPacket(frame));
      this.pending = this.pending.subarray(frameLength);
    }

    return packets;
  }

  getBufferedByteLength(): number {
    return this.pending.length;
  }
}
