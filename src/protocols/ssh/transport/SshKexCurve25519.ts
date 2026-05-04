import { Buffer } from "node:buffer";
import { createPublicKey, diffieHellman, generateKeyPairSync, type KeyObject } from "node:crypto";
import { ConfigurationError, ParseError } from "../../../errors/ZeroTransferError";
import { SshDataReader, SshDataWriter } from "../binary";

const SSH_MSG_KEX_ECDH_INIT = 30;
const SSH_MSG_KEX_ECDH_REPLY = 31;
const X25519_PUBLIC_KEY_LENGTH = 32;

// DER SubjectPublicKeyInfo prefix for X25519 public keys (RFC 8410).
const X25519_SPKI_PREFIX = Buffer.from("302a300506032b656e032100", "hex");

/** Parsed SSH_MSG_KEX_ECDH_INIT payload. */
export interface SshKexEcdhInitMessage {
  clientPublicKey: Buffer;
  messageType: number;
}

/** Parsed SSH_MSG_KEX_ECDH_REPLY payload. */
export interface SshKexEcdhReplyMessage {
  hostKey: Buffer;
  messageType: number;
  serverPublicKey: Buffer;
  signature: Buffer;
}

/**
 * Generates a client Curve25519 ephemeral keypair with SSH wire-format helpers.
 */
export function createCurve25519Ephemeral(): {
  deriveSharedSecret: (serverPublicKey: Uint8Array) => Buffer;
  publicKey: Buffer;
} {
  const { privateKey, publicKey } = generateKeyPairSync("x25519");
  const encodedPublicKey = exportX25519PublicKeyRaw(publicKey);

  return {
    deriveSharedSecret: (serverPublicKey) => {
      const peer = importX25519PublicKeyRaw(serverPublicKey);
      return diffieHellman({ privateKey, publicKey: peer });
    },
    publicKey: encodedPublicKey,
  };
}

/**
 * Encodes SSH_MSG_KEX_ECDH_INIT payload bytes.
 */
export function encodeSshKexEcdhInitMessage(publicKey: Uint8Array): Buffer {
  const normalized = normalizeX25519PublicKey(publicKey, "client");
  return new SshDataWriter().writeByte(SSH_MSG_KEX_ECDH_INIT).writeString(normalized).toBuffer();
}

/**
 * Decodes SSH_MSG_KEX_ECDH_INIT payload bytes.
 */
export function decodeSshKexEcdhInitMessage(payload: Uint8Array): SshKexEcdhInitMessage {
  const reader = new SshDataReader(payload);
  const messageType = reader.readByte();

  if (messageType !== SSH_MSG_KEX_ECDH_INIT) {
    throw new ParseError({
      details: { messageType },
      message: "Expected SSH_MSG_KEX_ECDH_INIT payload",
      protocol: "sftp",
      retryable: false,
    });
  }

  const clientPublicKey = normalizeX25519PublicKey(reader.readString(), "client");
  reader.assertFinished();
  return { clientPublicKey, messageType };
}

/**
 * Encodes SSH_MSG_KEX_ECDH_REPLY payload bytes.
 */
export function encodeSshKexEcdhReplyMessage(input: {
  hostKey: Uint8Array;
  serverPublicKey: Uint8Array;
  signature: Uint8Array;
}): Buffer {
  const serverPublicKey = normalizeX25519PublicKey(input.serverPublicKey, "server");

  return new SshDataWriter()
    .writeByte(SSH_MSG_KEX_ECDH_REPLY)
    .writeString(input.hostKey)
    .writeString(serverPublicKey)
    .writeString(input.signature)
    .toBuffer();
}

/**
 * Decodes SSH_MSG_KEX_ECDH_REPLY payload bytes.
 */
export function decodeSshKexEcdhReplyMessage(payload: Uint8Array): SshKexEcdhReplyMessage {
  const reader = new SshDataReader(payload);
  const messageType = reader.readByte();

  if (messageType !== SSH_MSG_KEX_ECDH_REPLY) {
    throw new ParseError({
      details: { messageType },
      message: "Expected SSH_MSG_KEX_ECDH_REPLY payload",
      protocol: "sftp",
      retryable: false,
    });
  }

  const hostKey = reader.readString();
  const serverPublicKey = normalizeX25519PublicKey(reader.readString(), "server");
  const signature = reader.readString();
  reader.assertFinished();

  return {
    hostKey,
    messageType,
    serverPublicKey,
    signature,
  };
}

function exportX25519PublicKeyRaw(publicKey: KeyObject): Buffer {
  const der = publicKey.export({ format: "der", type: "spki" });
  const raw = der.subarray(der.length - X25519_PUBLIC_KEY_LENGTH);
  return normalizeX25519PublicKey(raw, "client");
}

function importX25519PublicKeyRaw(raw: Uint8Array): KeyObject {
  const normalized = normalizeX25519PublicKey(raw, "server");
  const der = Buffer.concat([X25519_SPKI_PREFIX, normalized]);
  return createPublicKey({
    format: "der",
    key: der,
    type: "spki",
  });
}

function normalizeX25519PublicKey(value: Uint8Array, label: "client" | "server"): Buffer {
  const key = Buffer.from(value);
  if (key.length !== X25519_PUBLIC_KEY_LENGTH) {
    throw new ConfigurationError({
      details: { keyLength: key.length, label },
      message: `SSH ${label} Curve25519 public key must be 32 bytes`,
      protocol: "sftp",
      retryable: false,
    });
  }

  return key;
}
