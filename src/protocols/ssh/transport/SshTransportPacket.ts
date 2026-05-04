import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { ConfigurationError, ParseError } from "../../../errors/ZeroTransferError";

const MIN_PADDING_LENGTH = 4;
const MIN_PACKET_LENGTH = 1 + MIN_PADDING_LENGTH;

/** Decoded SSH transport packet before decryption/MAC pipelines are applied. */
export interface SshTransportPacket {
  padding: Buffer;
  paddingLength: number;
  payload: Buffer;
}

/**
 * Encodes an SSH binary packet using RFC 4253 framing for the cleartext phase.
 */
export function encodeSshTransportPacket(
  payload: Uint8Array,
  options: {
    blockSize?: number;
    randomPadding?: boolean;
  } = {},
): Buffer {
  const body = Buffer.from(payload);
  const blockSize = normalizeBlockSize(options.blockSize ?? 8);

  // packet_length covers padding_length + payload + padding, and packet_length+4
  // must align to the transport block size.
  let paddingLength = MIN_PADDING_LENGTH;
  while ((1 + body.length + paddingLength + 4) % blockSize !== 0) {
    paddingLength += 1;
  }

  const padding =
    options.randomPadding === false ? Buffer.alloc(paddingLength) : randomBytes(paddingLength);
  const packetLength = 1 + body.length + paddingLength;
  const frame = Buffer.allocUnsafe(4 + packetLength);

  frame.writeUInt32BE(packetLength, 0);
  frame.writeUInt8(paddingLength, 4);
  body.copy(frame, 5);
  padding.copy(frame, 5 + body.length);

  return frame;
}

/**
 * Decodes a complete SSH transport frame into payload and padding metadata.
 */
export function decodeSshTransportPacket(frame: Uint8Array): SshTransportPacket {
  const bytes = Buffer.from(frame);
  if (bytes.length < 4 + MIN_PACKET_LENGTH) {
    throw new ParseError({
      details: { length: bytes.length },
      message: "SSH transport frame is too short",
      protocol: "sftp",
      retryable: false,
    });
  }

  const packetLength = bytes.readUInt32BE(0);
  if (packetLength < MIN_PACKET_LENGTH) {
    throw new ParseError({
      details: { packetLength },
      message: "SSH transport packet length is invalid",
      protocol: "sftp",
      retryable: false,
    });
  }

  const totalLength = 4 + packetLength;
  if (bytes.length !== totalLength) {
    throw new ParseError({
      details: { actualLength: bytes.length, expectedLength: totalLength },
      message: "SSH transport packet length prefix does not match frame size",
      protocol: "sftp",
      retryable: false,
    });
  }

  const paddingLength = bytes.readUInt8(4);
  if (paddingLength < MIN_PADDING_LENGTH) {
    throw new ParseError({
      details: { paddingLength },
      message: "SSH transport packet padding length is invalid",
      protocol: "sftp",
      retryable: false,
    });
  }

  const payloadLength = packetLength - 1 - paddingLength;
  if (payloadLength < 0) {
    throw new ParseError({
      details: { packetLength, paddingLength },
      message: "SSH transport packet payload length is negative",
      protocol: "sftp",
      retryable: false,
    });
  }

  const payloadStart = 5;
  const payloadEnd = payloadStart + payloadLength;

  return {
    padding: bytes.subarray(payloadEnd, payloadEnd + paddingLength),
    paddingLength,
    payload: bytes.subarray(payloadStart, payloadEnd),
  };
}

/**
 * Streaming framer for SSH transport packets from arbitrary TCP chunk boundaries.
 */
export class SshTransportPacketFramer {
  private pending = Buffer.alloc(0);

  push(chunk: Uint8Array): SshTransportPacket[] {
    this.pending = Buffer.concat([this.pending, Buffer.from(chunk)]);
    const packets: SshTransportPacket[] = [];

    while (this.pending.length >= 4) {
      const packetLength = this.pending.readUInt32BE(0);
      const frameLength = 4 + packetLength;

      if (this.pending.length < frameLength) {
        break;
      }

      const frame = this.pending.subarray(0, frameLength);
      packets.push(decodeSshTransportPacket(frame));
      this.pending = this.pending.subarray(frameLength);
    }

    return packets;
  }

  getBufferedByteLength(): number {
    return this.pending.length;
  }

  /** Returns and clears any bytes buffered but not yet part of a complete packet. */
  takeRemainingBytes(): Buffer {
    const remaining = Buffer.from(this.pending);
    this.pending = Buffer.alloc(0);
    return remaining;
  }
}

function normalizeBlockSize(blockSize: number): number {
  if (!Number.isInteger(blockSize) || blockSize < 8 || blockSize > 255) {
    throw new ConfigurationError({
      details: { blockSize },
      message: "SSH transport block size must be an integer between 8 and 255",
      protocol: "sftp",
      retryable: false,
    });
  }

  return blockSize;
}
