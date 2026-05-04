/**
 * SSH Authentication Protocol message codecs (RFC 4252).
 *
 * Covers:
 * - SSH_MSG_SERVICE_REQUEST / SSH_MSG_SERVICE_ACCEPT
 * - SSH_MSG_USERAUTH_REQUEST (none, password, publickey)
 * - SSH_MSG_USERAUTH_SUCCESS / SSH_MSG_USERAUTH_FAILURE
 * - SSH_MSG_USERAUTH_BANNER
 * - SSH_MSG_USERAUTH_PK_OK (publickey pre-auth query response)
 * - SSH_MSG_USERAUTH_INFO_REQUEST / SSH_MSG_USERAUTH_INFO_RESPONSE (keyboard-interactive, RFC 4256)
 */
import type { Buffer } from "node:buffer";
import { ParseError } from "../../../errors/ZeroTransferError";
import { SshDataReader } from "../binary/SshDataReader";
import { SshDataWriter } from "../binary/SshDataWriter";

// -- Message type constants --------------------------------------------------

export const SSH_MSG_SERVICE_REQUEST = 5;
export const SSH_MSG_SERVICE_ACCEPT = 6;
export const SSH_MSG_USERAUTH_REQUEST = 50;
export const SSH_MSG_USERAUTH_FAILURE = 51;
export const SSH_MSG_USERAUTH_SUCCESS = 52;
export const SSH_MSG_USERAUTH_BANNER = 53;
export const SSH_MSG_USERAUTH_PK_OK = 60;
export const SSH_MSG_USERAUTH_INFO_REQUEST = 60; // keyboard-interactive
export const SSH_MSG_USERAUTH_INFO_RESPONSE = 61; // keyboard-interactive

// -- Service request / accept ------------------------------------------------

/**
 * Encodes SSH_MSG_SERVICE_REQUEST payload (RFC 4253 §10).
 * The service name is always "ssh-userauth" before authentication.
 */
export function encodeSshServiceRequest(serviceName: string): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_SERVICE_REQUEST)
    .writeString(serviceName, "utf8")
    .toBuffer();
}

/**
 * Decodes SSH_MSG_SERVICE_ACCEPT payload.
 * Returns the echoed service name.
 */
export function decodeSshServiceAccept(payload: Uint8Array): { serviceName: string } {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_SERVICE_ACCEPT) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_SERVICE_ACCEPT",
      protocol: "sftp",
      retryable: false,
    });
  }
  return { serviceName: reader.readString().toString("utf8") };
}

// -- USERAUTH REQUEST ---------------------------------------------------------

/** Common fields for all USERAUTH request methods. */
interface UserauthRequestBase {
  serviceName: string;
  username: string;
}

/** SSH_MSG_USERAUTH_REQUEST with method "none" — probes allowed methods. */
export function encodeUserauthRequestNone(args: UserauthRequestBase): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_USERAUTH_REQUEST)
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("none", "ascii")
    .toBuffer();
}

/** SSH_MSG_USERAUTH_REQUEST with method "password". */
export function encodeUserauthRequestPassword(
  args: UserauthRequestBase & { password: string },
): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_USERAUTH_REQUEST)
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("password", "ascii")
    .writeBoolean(false) // change-password is not supported
    .writeString(args.password, "utf8")
    .toBuffer();
}

/**
 * SSH_MSG_USERAUTH_REQUEST with method "publickey" — pre-auth query.
 * Asks the server if it would accept a signature from this key, without providing one.
 */
export function encodeUserauthRequestPublickeyQuery(
  args: UserauthRequestBase & { algorithmName: string; publicKeyBlob: Uint8Array },
): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_USERAUTH_REQUEST)
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("publickey", "ascii")
    .writeBoolean(false)
    .writeString(args.algorithmName, "ascii")
    .writeString(args.publicKeyBlob)
    .toBuffer();
}

/**
 * SSH_MSG_USERAUTH_REQUEST with method "publickey" — actual signature.
 * sessionId is the exchange hash / session identifier from key exchange.
 */
export function encodeUserauthRequestPublickeySign(
  args: UserauthRequestBase & {
    algorithmName: string;
    publicKeyBlob: Uint8Array;
    signature: Uint8Array;
  },
): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_USERAUTH_REQUEST)
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("publickey", "ascii")
    .writeBoolean(true)
    .writeString(args.algorithmName, "ascii")
    .writeString(args.publicKeyBlob)
    .writeString(args.signature)
    .toBuffer();
}

/**
 * Builds the exact byte sequence that must be signed for publickey auth (RFC 4252 §7).
 * The signature covers: session_id || SSH_MSG_USERAUTH_REQUEST || fields.
 */
export function buildPublickeySignData(
  args: UserauthRequestBase & {
    algorithmName: string;
    publicKeyBlob: Uint8Array;
    sessionId: Uint8Array;
  },
): Buffer {
  return new SshDataWriter()
    .writeString(args.sessionId) // length-prefixed session_id
    .writeByte(SSH_MSG_USERAUTH_REQUEST)
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("publickey", "ascii")
    .writeBoolean(true)
    .writeString(args.algorithmName, "ascii")
    .writeString(args.publicKeyBlob)
    .toBuffer();
}

// -- USERAUTH FAILURE ---------------------------------------------------------

export interface SshUserauthFailure {
  allowedAuthentications: string[];
  partialSuccess: boolean;
}

/**
 * Decodes SSH_MSG_USERAUTH_FAILURE payload.
 */
export function decodeSshUserauthFailure(payload: Uint8Array): SshUserauthFailure {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_FAILURE) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_FAILURE",
      protocol: "sftp",
      retryable: false,
    });
  }
  const nameList = reader.readString().toString("ascii");
  const allowedAuthentications = nameList.length === 0 ? [] : nameList.split(",");
  const partialSuccess = reader.readBoolean();
  return { allowedAuthentications, partialSuccess };
}

// -- USERAUTH BANNER ---------------------------------------------------------

export interface SshUserauthBanner {
  languageTag: string;
  message: string;
}

export function decodeSshUserauthBanner(payload: Uint8Array): SshUserauthBanner {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_BANNER) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_BANNER",
      protocol: "sftp",
      retryable: false,
    });
  }
  const message = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  return { languageTag, message };
}

// -- USERAUTH_PK_OK -----------------------------------------------------------

export interface SshUserauthPkOk {
  algorithmName: string;
  publicKeyBlob: Buffer;
}

export function decodeSshUserauthPkOk(payload: Uint8Array): SshUserauthPkOk {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_PK_OK) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_PK_OK",
      protocol: "sftp",
      retryable: false,
    });
  }
  return {
    algorithmName: reader.readString().toString("ascii"),
    publicKeyBlob: reader.readString(),
  };
}

// -- Keyboard-interactive (RFC 4256) -----------------------------------------

export interface SshUserauthInfoRequest {
  instruction: string;
  languageTag: string;
  name: string;
  prompts: Array<{ echo: boolean; prompt: string }>;
}

export function decodeSshUserauthInfoRequest(payload: Uint8Array): SshUserauthInfoRequest {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_INFO_REQUEST) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_INFO_REQUEST",
      protocol: "sftp",
      retryable: false,
    });
  }
  const name = reader.readString().toString("utf8");
  const instruction = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  const count = reader.readUint32();
  const prompts: Array<{ echo: boolean; prompt: string }> = [];
  for (let i = 0; i < count; i++) {
    const prompt = reader.readString().toString("utf8");
    const echo = reader.readBoolean();
    prompts.push({ echo, prompt });
  }
  return { instruction, languageTag, name, prompts };
}

export function encodeSshUserauthInfoResponse(responses: string[]): Buffer {
  const writer = new SshDataWriter()
    .writeByte(SSH_MSG_USERAUTH_INFO_RESPONSE)
    .writeUint32(responses.length);
  for (const r of responses) {
    writer.writeString(r, "utf8");
  }
  return writer.toBuffer();
}
