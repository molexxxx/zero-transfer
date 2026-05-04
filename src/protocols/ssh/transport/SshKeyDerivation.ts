import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { ProtocolError } from "../../../errors/ZeroTransferError";
import { SshDataWriter } from "../binary";
import type { NegotiatedSshAlgorithms } from "./SshAlgorithmNegotiation";

/** Directional key material used after SSH NEWKEYS. */
export interface SshTransportDirectionKeys {
  encryptionKey: Buffer;
  iv: Buffer;
  macKey: Buffer;
}

/** Session key bundle derived from K, H, and session id. */
export interface SshDerivedSessionKeys {
  clientToServer: SshTransportDirectionKeys;
  exchangeHash: Buffer;
  serverToClient: SshTransportDirectionKeys;
  sessionId: Buffer;
}

/** Input transcript used to compute SSH exchange hash for curve25519 KEX. */
export interface SshExchangeHashInput {
  clientIdentification: string;
  clientKexInitPayload: Uint8Array;
  clientPublicKey: Uint8Array;
  kexAlgorithm: string;
  negotiatedAlgorithms: NegotiatedSshAlgorithms;
  serverHostKey: Uint8Array;
  serverIdentification: string;
  serverKexInitPayload: Uint8Array;
  serverPublicKey: Uint8Array;
  sharedSecret: Uint8Array;
}

/**
 * Computes exchange hash and derives initial transport key material for the negotiated algorithms.
 */
export function deriveSshSessionKeys(input: SshExchangeHashInput): SshDerivedSessionKeys {
  const hashAlgorithm = resolveKexHashAlgorithm(input.kexAlgorithm);
  const exchangeHash = computeCurve25519ExchangeHash(input, hashAlgorithm);
  const sessionId = exchangeHash;

  const c2sEncryptionLength = resolveEncryptionKeyLength(
    input.negotiatedAlgorithms.encryptionClientToServer,
  );
  const s2cEncryptionLength = resolveEncryptionKeyLength(
    input.negotiatedAlgorithms.encryptionServerToClient,
  );
  const c2sIvLength = resolveIvLength(input.negotiatedAlgorithms.encryptionClientToServer);
  const s2cIvLength = resolveIvLength(input.negotiatedAlgorithms.encryptionServerToClient);
  const c2sMacLength = resolveMacKeyLength(
    input.negotiatedAlgorithms.encryptionClientToServer,
    input.negotiatedAlgorithms.macClientToServer,
  );
  const s2cMacLength = resolveMacKeyLength(
    input.negotiatedAlgorithms.encryptionServerToClient,
    input.negotiatedAlgorithms.macServerToClient,
  );

  const sharedSecret = Buffer.from(input.sharedSecret);

  return {
    clientToServer: {
      encryptionKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "C",
        c2sEncryptionLength,
        hashAlgorithm,
      ),
      iv: deriveMaterial(sharedSecret, exchangeHash, sessionId, "A", c2sIvLength, hashAlgorithm),
      macKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "E",
        c2sMacLength,
        hashAlgorithm,
      ),
    },
    exchangeHash,
    serverToClient: {
      encryptionKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "D",
        s2cEncryptionLength,
        hashAlgorithm,
      ),
      iv: deriveMaterial(sharedSecret, exchangeHash, sessionId, "B", s2cIvLength, hashAlgorithm),
      macKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "F",
        s2cMacLength,
        hashAlgorithm,
      ),
    },
    sessionId,
  };
}

function computeCurve25519ExchangeHash(
  input: SshExchangeHashInput,
  hashAlgorithm: "sha256",
): Buffer {
  const transcript = new SshDataWriter()
    .writeString(input.clientIdentification, "ascii")
    .writeString(input.serverIdentification, "ascii")
    .writeString(input.clientKexInitPayload)
    .writeString(input.serverKexInitPayload)
    .writeString(input.serverHostKey)
    .writeString(input.clientPublicKey)
    .writeString(input.serverPublicKey)
    .writeMpint(input.sharedSecret)
    .toBuffer();

  return createHash(hashAlgorithm).update(transcript).digest();
}

function deriveMaterial(
  sharedSecret: Buffer,
  exchangeHash: Buffer,
  sessionId: Buffer,
  letter: string,
  length: number,
  hashAlgorithm: "sha256",
): Buffer {
  if (length <= 0) {
    return Buffer.alloc(0);
  }

  const result: Buffer[] = [];

  const first = createHash(hashAlgorithm)
    .update(
      new SshDataWriter()
        .writeMpint(sharedSecret)
        .writeBytes(exchangeHash)
        .writeByte(letter.charCodeAt(0))
        .writeBytes(sessionId)
        .toBuffer(),
    )
    .digest();
  result.push(first);

  while (Buffer.concat(result).length < length) {
    const previous = Buffer.concat(result);
    const next = createHash(hashAlgorithm)
      .update(
        new SshDataWriter()
          .writeMpint(sharedSecret)
          .writeBytes(exchangeHash)
          .writeBytes(previous)
          .toBuffer(),
      )
      .digest();
    result.push(next);
  }

  return Buffer.concat(result).subarray(0, length);
}

function resolveKexHashAlgorithm(kexAlgorithm: string): "sha256" {
  if (kexAlgorithm === "curve25519-sha256" || kexAlgorithm === "curve25519-sha256@libssh.org") {
    return "sha256";
  }

  throw new ProtocolError({
    details: { kexAlgorithm },
    message: "Unsupported key exchange hash algorithm",
    protocol: "sftp",
    retryable: false,
  });
}

function resolveEncryptionKeyLength(algorithm: string): number {
  switch (algorithm) {
    case "chacha20-poly1305@openssh.com":
      return 64;
    case "aes128-gcm@openssh.com":
    case "aes128-ctr":
      return 16;
    case "aes256-gcm@openssh.com":
    case "aes256-ctr":
      return 32;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH encryption algorithm for key derivation",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function resolveIvLength(algorithm: string): number {
  switch (algorithm) {
    case "chacha20-poly1305@openssh.com":
      return 0;
    case "aes128-gcm@openssh.com":
    case "aes256-gcm@openssh.com":
      return 12;
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH encryption algorithm for IV derivation",
        protocol: "sftp",
        retryable: false,
      });
  }
}

function resolveMacKeyLength(encryptionAlgorithm: string, macAlgorithm: string): number {
  if (
    encryptionAlgorithm.endsWith("-gcm@openssh.com") ||
    encryptionAlgorithm === "chacha20-poly1305@openssh.com"
  ) {
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
        message: "Unsupported SSH MAC algorithm for key derivation",
        protocol: "sftp",
        retryable: false,
      });
  }
}
