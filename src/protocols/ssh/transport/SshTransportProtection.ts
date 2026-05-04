import { Buffer } from "node:buffer";
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  timingSafeEqual,
  type Cipheriv,
  type Decipheriv,
} from "node:crypto";
import { ProtocolError } from "../../../errors/ZeroTransferError";
import type { NegotiatedSshAlgorithms } from "./SshAlgorithmNegotiation";
import type { SshTransportDirectionKeys } from "./SshKeyDerivation";
import { decodeSshTransportPacket, encodeSshTransportPacket } from "./SshTransportPacket";

/** Bidirectional packet protection pair for SSH transport after NEWKEYS. */
export interface SshTransportProtectionContext {
  inbound: SshTransportPacketUnprotector;
  outbound: SshTransportPacketProtector;
}

/**
 * Creates directional packet protectors for the currently negotiated transport algorithms.
 */
export function createSshTransportProtectionContext(input: {
  keys: {
    clientToServer: SshTransportDirectionKeys;
    serverToClient: SshTransportDirectionKeys;
  };
  negotiatedAlgorithms: NegotiatedSshAlgorithms;
  deterministicPadding?: boolean;
  initialInboundSequence?: number;
  initialOutboundSequence?: number;
}): SshTransportProtectionContext {
  return {
    inbound: new SshTransportPacketUnprotector({
      encryptionAlgorithm: input.negotiatedAlgorithms.encryptionServerToClient,
      initialSequence: input.initialInboundSequence ?? 0,
      macAlgorithm: input.negotiatedAlgorithms.macServerToClient,
      keys: input.keys.serverToClient,
    }),
    outbound: new SshTransportPacketProtector({
      deterministicPadding: input.deterministicPadding ?? false,
      encryptionAlgorithm: input.negotiatedAlgorithms.encryptionClientToServer,
      initialSequence: input.initialOutboundSequence ?? 0,
      macAlgorithm: input.negotiatedAlgorithms.macClientToServer,
      keys: input.keys.clientToServer,
    }),
  };
}

/** Encrypts and authenticates outbound SSH transport packets. */
export class SshTransportPacketProtector {
  private readonly blockLength: number;
  private readonly cipher: Cipheriv | undefined;
  private readonly encryptionAlgorithm: string;
  private readonly macAlgorithm: string;
  private readonly macLength: number;
  private sequenceNumber: number;

  constructor(
    private readonly options: {
      deterministicPadding: boolean;
      encryptionAlgorithm: string;
      initialSequence: number;
      macAlgorithm: string;
      keys: SshTransportDirectionKeys;
    },
  ) {
    this.encryptionAlgorithm = options.encryptionAlgorithm;
    this.macAlgorithm = options.macAlgorithm;
    this.sequenceNumber = options.initialSequence >>> 0;
    this.blockLength = resolveBlockLength(options.encryptionAlgorithm);
    this.macLength = resolveMacLength(options.encryptionAlgorithm, options.macAlgorithm);
    this.cipher = createCipher(
      options.encryptionAlgorithm,
      options.keys.encryptionKey,
      options.keys.iv,
    );
  }

  getSequenceNumber(): number {
    return this.sequenceNumber;
  }

  protectPayload(payload: Uint8Array): Buffer {
    const clearPacket = encodeSshTransportPacket(payload, {
      blockSize: this.blockLength,
      randomPadding: !this.options.deterministicPadding,
    });
    const mac = computeMac(
      this.macAlgorithm,
      this.options.keys.macKey,
      this.sequenceNumber,
      clearPacket,
      this.macLength,
    );
    const encrypted = this.cipher === undefined ? clearPacket : this.cipher.update(clearPacket);

    this.sequenceNumber = (this.sequenceNumber + 1) >>> 0;
    return Buffer.concat([encrypted, mac]);
  }
}

/** Verifies and decrypts inbound SSH transport packets. */
export class SshTransportPacketUnprotector {
  private readonly blockLength: number;
  private readonly decipher: Decipheriv | undefined;
  private readonly encryptionAlgorithm: string;
  private readonly macAlgorithm: string;
  private readonly macLength: number;
  private sequenceNumber: number;

  // Streaming framing state for pushBytes()
  private framePartialDecrypted: Buffer | undefined;
  private framePendingRaw = Buffer.alloc(0);
  private frameRemainingNeeded: number | undefined;

  constructor(
    private readonly options: {
      encryptionAlgorithm: string;
      initialSequence: number;
      macAlgorithm: string;
      keys: SshTransportDirectionKeys;
    },
  ) {
    this.encryptionAlgorithm = options.encryptionAlgorithm;
    this.macAlgorithm = options.macAlgorithm;
    this.sequenceNumber = options.initialSequence >>> 0;
    this.blockLength = resolveBlockLength(options.encryptionAlgorithm);
    this.macLength = resolveMacLength(options.encryptionAlgorithm, options.macAlgorithm);
    this.decipher = createDecipher(
      options.encryptionAlgorithm,
      options.keys.encryptionKey,
      options.keys.iv,
    );
  }

  getSequenceNumber(): number {
    return this.sequenceNumber;
  }

  /**
   * Feeds raw encrypted bytes from the socket and returns any fully decoded payloads.
   * Maintains internal framing state across calls — pass each `data` event chunk directly.
   */
  pushBytes(chunk: Buffer): Buffer[] {
    this.framePendingRaw = Buffer.concat([this.framePendingRaw, chunk]);
    const results: Buffer[] = [];

    while (true) {
      if (this.framePartialDecrypted === undefined) {
        // Phase 1: buffer the first cipher block to read the encrypted packet_length.
        if (this.framePendingRaw.length < this.blockLength) break;
        const firstBlock = this.framePendingRaw.subarray(0, this.blockLength);
        this.framePendingRaw = Buffer.from(this.framePendingRaw.subarray(this.blockLength));
        this.framePartialDecrypted = this.decipher
          ? Buffer.from(this.decipher.update(firstBlock))
          : Buffer.from(firstBlock);
        const packetLength = this.framePartialDecrypted.readUInt32BE(0);
        // Total encrypted bytes = 4 (length field) + packetLength.
        // Remaining raw after first block = (4 + packetLength - blockLength) + macLength.
        const remaining = 4 + packetLength - this.blockLength + this.macLength;
        if (remaining < 0) {
          throw new ProtocolError({
            details: { blockLength: this.blockLength, packetLength },
            message: "SSH encrypted packet_length is smaller than one cipher block",
            protocol: "sftp",
            retryable: false,
          });
        }
        this.frameRemainingNeeded = remaining;
      }

      const needed = this.frameRemainingNeeded!;
      if (this.framePendingRaw.length < needed) break;

      const encryptedRest = this.framePendingRaw.subarray(0, needed - this.macLength);
      const receivedMac = this.framePendingRaw.subarray(needed - this.macLength, needed);
      this.framePendingRaw = Buffer.from(this.framePendingRaw.subarray(needed));

      const decryptedRest =
        encryptedRest.length > 0
          ? this.decipher
            ? Buffer.from(this.decipher.update(encryptedRest))
            : Buffer.from(encryptedRest)
          : Buffer.alloc(0);

      const clearPacket = Buffer.concat([this.framePartialDecrypted, decryptedRest]);
      const expectedMac = computeMac(
        this.macAlgorithm,
        this.options.keys.macKey,
        this.sequenceNumber,
        clearPacket,
        this.macLength,
      );

      if (!timingSafeEqual(receivedMac, expectedMac)) {
        throw new ProtocolError({
          message: "SSH packet MAC verification failed",
          protocol: "sftp",
          retryable: false,
        });
      }

      this.sequenceNumber = (this.sequenceNumber + 1) >>> 0;
      results.push(decodeSshTransportPacket(clearPacket).payload);

      this.framePartialDecrypted = undefined;
      this.frameRemainingNeeded = undefined;
    }

    return results;
  }

  unprotectPayload(packet: Uint8Array): Buffer {
    const frame = Buffer.from(packet);
    if (frame.length < this.macLength) {
      throw new ProtocolError({
        details: { length: frame.length, macLength: this.macLength },
        message: "SSH packet is shorter than its expected MAC length",
        protocol: "sftp",
        retryable: false,
      });
    }

    const macOffset = frame.length - this.macLength;
    const encryptedPacket = frame.subarray(0, macOffset);
    const receivedMac = frame.subarray(macOffset);
    const clearPacket =
      this.decipher === undefined ? encryptedPacket : this.decipher.update(encryptedPacket);
    const expectedMac = computeMac(
      this.macAlgorithm,
      this.options.keys.macKey,
      this.sequenceNumber,
      clearPacket,
      this.macLength,
    );

    if (!timingSafeEqual(receivedMac, expectedMac)) {
      throw new ProtocolError({
        message: "SSH packet MAC verification failed",
        protocol: "sftp",
        retryable: false,
      });
    }

    this.sequenceNumber = (this.sequenceNumber + 1) >>> 0;
    return decodeSshTransportPacket(clearPacket).payload;
  }
}

function createCipher(algorithm: string, key: Buffer, iv: Buffer): Cipheriv | undefined {
  if (algorithm === "none") {
    return undefined;
  }

  validateCipherMaterial(algorithm, key, iv);
  const cipher = createCipheriv(toOpenSslCipherName(algorithm), key, iv);
  cipher.setAutoPadding(false);
  return cipher;
}

function createDecipher(algorithm: string, key: Buffer, iv: Buffer): Decipheriv | undefined {
  if (algorithm === "none") {
    return undefined;
  }

  validateCipherMaterial(algorithm, key, iv);
  const decipher = createDecipheriv(toOpenSslCipherName(algorithm), key, iv);
  decipher.setAutoPadding(false);
  return decipher;
}

function toOpenSslCipherName(algorithm: string): string {
  switch (algorithm) {
    case "aes128-ctr":
      return "aes-128-ctr";
    case "aes256-ctr":
      return "aes-256-ctr";
    default:
      return algorithm;
  }
}

function validateCipherMaterial(algorithm: string, key: Buffer, iv: Buffer): void {
  const expectedKeyLength = resolveCipherKeyLength(algorithm);
  const expectedIvLength = resolveCipherIvLength(algorithm);

  if (key.length !== expectedKeyLength || iv.length !== expectedIvLength) {
    throw new ProtocolError({
      details: {
        algorithm,
        ivLength: iv.length,
        keyLength: key.length,
      },
      message: "SSH cipher key material does not match algorithm requirements",
      protocol: "sftp",
      retryable: false,
    });
  }
}

function resolveCipherKeyLength(algorithm: string): number {
  switch (algorithm) {
    case "aes128-ctr":
      return 16;
    case "aes256-ctr":
      return 32;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher algorithm for transport protection",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function resolveCipherIvLength(algorithm: string): number {
  switch (algorithm) {
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher IV length for transport protection",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function resolveBlockLength(algorithm: string): number {
  switch (algorithm) {
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    case "none":
      return 8; // RFC 4253 §6.1: minimum block size for framing with no cipher
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher block length for transport protection",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function resolveMacLength(encryptionAlgorithm: string, macAlgorithm: string): number {
  if (encryptionAlgorithm === "none") {
    return 0;
  }

  switch (macAlgorithm) {
    case "hmac-sha2-256":
      return 32;
    case "hmac-sha2-512":
      return 64;
    default:
      throw new ProtocolError({
        details: { macAlgorithm },
        message: "Unsupported SSH MAC algorithm for transport protection",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function computeMac(
  macAlgorithm: string,
  macKey: Buffer,
  sequence: number,
  packet: Buffer,
  macLength: number,
): Buffer {
  if (macLength === 0) {
    return Buffer.alloc(0);
  }

  const hashName = macAlgorithm === "hmac-sha2-512" ? "sha512" : "sha256";
  const sequenceBuffer = Buffer.allocUnsafe(4);
  sequenceBuffer.writeUInt32BE(sequence >>> 0, 0);

  return createHmac(hashName, macKey)
    .update(sequenceBuffer)
    .update(packet)
    .digest()
    .subarray(0, macLength);
}
