import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { ConfigurationError, ParseError } from "../../../errors/ZeroTransferError";
import { SshDataReader, SshDataWriter } from "../binary";
import type { SshAlgorithmPreferences } from "./SshAlgorithmNegotiation";

const SSH_MSG_KEXINIT = 20;
const KEXINIT_COOKIE_LENGTH = 16;

/** Parsed SSH_MSG_KEXINIT payload. */
export interface SshKexInitMessage extends SshAlgorithmPreferences {
  cookie: Buffer;
  firstKexPacketFollows: boolean;
  messageType: number;
  reserved: number;
}

/**
 * Encodes SSH_MSG_KEXINIT payload bytes (starting with message number 20).
 */
export function encodeSshKexInitMessage(options: {
  algorithms: SshAlgorithmPreferences;
  cookie?: Uint8Array;
  firstKexPacketFollows?: boolean;
}): Buffer {
  const cookie =
    options.cookie === undefined ? randomBytes(KEXINIT_COOKIE_LENGTH) : Buffer.from(options.cookie);

  if (cookie.length !== KEXINIT_COOKIE_LENGTH) {
    throw new ConfigurationError({
      details: { actualLength: cookie.length, expectedLength: KEXINIT_COOKIE_LENGTH },
      message: "SSH KEXINIT cookie must be 16 bytes",
      protocol: "sftp",
      retryable: false,
    });
  }

  const writer = new SshDataWriter();
  writer.writeByte(SSH_MSG_KEXINIT);
  writer.writeBytes(cookie);
  writer.writeNameList(options.algorithms.kexAlgorithms);
  writer.writeNameList(options.algorithms.serverHostKeyAlgorithms);
  writer.writeNameList(options.algorithms.encryptionClientToServer);
  writer.writeNameList(options.algorithms.encryptionServerToClient);
  writer.writeNameList(options.algorithms.macClientToServer);
  writer.writeNameList(options.algorithms.macServerToClient);
  writer.writeNameList(options.algorithms.compressionClientToServer);
  writer.writeNameList(options.algorithms.compressionServerToClient);
  writer.writeNameList(options.algorithms.languagesClientToServer);
  writer.writeNameList(options.algorithms.languagesServerToClient);
  writer.writeBoolean(options.firstKexPacketFollows ?? false);
  writer.writeUint32(0);
  return writer.toBuffer();
}

/**
 * Decodes SSH_MSG_KEXINIT payload bytes into algorithm lists and flags.
 */
export function decodeSshKexInitMessage(payload: Uint8Array): SshKexInitMessage {
  const reader = new SshDataReader(payload);
  const messageType = reader.readByte();

  if (messageType !== SSH_MSG_KEXINIT) {
    throw new ParseError({
      details: { messageType },
      message: "Expected SSH_MSG_KEXINIT payload",
      protocol: "sftp",
      retryable: false,
    });
  }

  const cookie = reader.readBytes(KEXINIT_COOKIE_LENGTH);
  const kexAlgorithms = reader.readNameList();
  const serverHostKeyAlgorithms = reader.readNameList();
  const encryptionClientToServer = reader.readNameList();
  const encryptionServerToClient = reader.readNameList();
  const macClientToServer = reader.readNameList();
  const macServerToClient = reader.readNameList();
  const compressionClientToServer = reader.readNameList();
  const compressionServerToClient = reader.readNameList();
  const languagesClientToServer = reader.readNameList();
  const languagesServerToClient = reader.readNameList();
  const firstKexPacketFollows = reader.readBoolean();
  const reserved = reader.readUint32();

  reader.assertFinished();

  return {
    compressionClientToServer,
    compressionServerToClient,
    cookie,
    encryptionClientToServer,
    encryptionServerToClient,
    firstKexPacketFollows,
    kexAlgorithms,
    languagesClientToServer,
    languagesServerToClient,
    macClientToServer,
    macServerToClient,
    messageType,
    reserved,
    serverHostKeyAlgorithms,
  };
}
