/**
 * SSH Connection Protocol message codecs (RFC 4254).
 *
 * Covers:
 * - SSH_MSG_CHANNEL_OPEN / CHANNEL_OPEN_CONFIRMATION / CHANNEL_OPEN_FAILURE
 * - SSH_MSG_CHANNEL_REQUEST (exec, subsystem, pty-req, env, signal, exit-status)
 * - SSH_MSG_CHANNEL_SUCCESS / CHANNEL_FAILURE
 * - SSH_MSG_CHANNEL_DATA / CHANNEL_EXTENDED_DATA
 * - SSH_MSG_CHANNEL_WINDOW_ADJUST
 * - SSH_MSG_CHANNEL_EOF / CHANNEL_CLOSE
 */
import type { Buffer } from "node:buffer";
import { ParseError } from "../../../errors/ZeroTransferError";
import { SshDataReader } from "../binary/SshDataReader";
import { SshDataWriter } from "../binary/SshDataWriter";

// -- Message type constants --------------------------------------------------

export const SSH_MSG_CHANNEL_OPEN = 90;
export const SSH_MSG_CHANNEL_OPEN_CONFIRMATION = 91;
export const SSH_MSG_CHANNEL_OPEN_FAILURE = 92;
export const SSH_MSG_CHANNEL_WINDOW_ADJUST = 93;
export const SSH_MSG_CHANNEL_DATA = 94;
export const SSH_MSG_CHANNEL_EXTENDED_DATA = 95;
export const SSH_MSG_CHANNEL_EOF = 96;
export const SSH_MSG_CHANNEL_CLOSE = 97;
export const SSH_MSG_CHANNEL_REQUEST = 98;
export const SSH_MSG_CHANNEL_SUCCESS = 99;
export const SSH_MSG_CHANNEL_FAILURE = 100;

/** Channel open failure reason codes (RFC 4254 §5.1). */
export const SshChannelOpenFailureReason = {
  ADMINISTRATIVELY_PROHIBITED: 1,
  CONNECT_FAILED: 2,
  UNKNOWN_CHANNEL_TYPE: 3,
  RESOURCE_SHORTAGE: 4,
} as const;

// -- CHANNEL_OPEN -------------------------------------------------------------

export interface SshChannelOpenArgs {
  channelType: string;
  senderChannel: number;
  /** Initial local window size (bytes). */
  initialWindowSize: number;
  /** Maximum packet size the sender can accept. */
  maxPacketSize: number;
}

export function encodeSshChannelOpen(args: SshChannelOpenArgs): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_OPEN)
    .writeString(args.channelType, "ascii")
    .writeUint32(args.senderChannel)
    .writeUint32(args.initialWindowSize)
    .writeUint32(args.maxPacketSize)
    .toBuffer();
}

// -- CHANNEL_OPEN_CONFIRMATION -------------------------------------------------

export interface SshChannelOpenConfirmation {
  recipientChannel: number;
  senderChannel: number;
  initialWindowSize: number;
  maxPacketSize: number;
}

export function decodeSshChannelOpenConfirmation(payload: Uint8Array): SshChannelOpenConfirmation {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_OPEN_CONFIRMATION) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_OPEN_CONFIRMATION",
      protocol: "sftp",
      retryable: false,
    });
  }
  const recipientChannel = reader.readUint32();
  const senderChannel = reader.readUint32();
  const initialWindowSize = reader.readUint32();
  const maxPacketSize = reader.readUint32();
  return { initialWindowSize, maxPacketSize, recipientChannel, senderChannel };
}

// -- CHANNEL_OPEN_FAILURE ------------------------------------------------------

export interface SshChannelOpenFailure {
  recipientChannel: number;
  reasonCode: number;
  description: string;
  languageTag: string;
}

export function decodeSshChannelOpenFailure(payload: Uint8Array): SshChannelOpenFailure {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_OPEN_FAILURE) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_OPEN_FAILURE",
      protocol: "sftp",
      retryable: false,
    });
  }
  const recipientChannel = reader.readUint32();
  const reasonCode = reader.readUint32();
  const description = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  return { description, languageTag, reasonCode, recipientChannel };
}

// -- CHANNEL_REQUEST -----------------------------------------------------------

export function encodeSshChannelRequestSubsystem(args: {
  recipientChannel: number;
  subsystemName: string;
  wantReply: boolean;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_REQUEST)
    .writeUint32(args.recipientChannel)
    .writeString("subsystem", "ascii")
    .writeBoolean(args.wantReply)
    .writeString(args.subsystemName, "ascii")
    .toBuffer();
}

export function encodeSshChannelRequestExec(args: {
  recipientChannel: number;
  command: string;
  wantReply: boolean;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_REQUEST)
    .writeUint32(args.recipientChannel)
    .writeString("exec", "ascii")
    .writeBoolean(args.wantReply)
    .writeString(args.command, "utf8")
    .toBuffer();
}

export function encodeSshChannelRequestEnv(args: {
  recipientChannel: number;
  variableName: string;
  variableValue: string;
  wantReply: boolean;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_REQUEST)
    .writeUint32(args.recipientChannel)
    .writeString("env", "ascii")
    .writeBoolean(args.wantReply)
    .writeString(args.variableName, "utf8")
    .writeString(args.variableValue, "utf8")
    .toBuffer();
}

export function encodeSshChannelRequestSignal(args: {
  recipientChannel: number;
  signalName: string;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_REQUEST)
    .writeUint32(args.recipientChannel)
    .writeString("signal", "ascii")
    .writeBoolean(false) // RFC 4254 §6.9 says wantReply MUST be false
    .writeString(args.signalName, "ascii")
    .toBuffer();
}

// -- CHANNEL_SUCCESS / CHANNEL_FAILURE -----------------------------------------

export function encodeSshChannelSuccess(recipientChannel: number): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_SUCCESS)
    .writeUint32(recipientChannel)
    .toBuffer();
}

export function encodeSshChannelFailure(recipientChannel: number): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_FAILURE)
    .writeUint32(recipientChannel)
    .toBuffer();
}

// -- CHANNEL_DATA --------------------------------------------------------------

export function encodeSshChannelData(args: { recipientChannel: number; data: Uint8Array }): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_DATA)
    .writeUint32(args.recipientChannel)
    .writeString(args.data)
    .toBuffer();
}

export interface SshChannelDataMessage {
  recipientChannel: number;
  data: Buffer;
}

export function decodeSshChannelData(payload: Uint8Array): SshChannelDataMessage {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_DATA) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_DATA",
      protocol: "sftp",
      retryable: false,
    });
  }
  const recipientChannel = reader.readUint32();
  const data = reader.readString();
  return { data, recipientChannel };
}

/** Standard extended data type codes. */
export const SSH_EXTENDED_DATA_STDERR = 1;

export function encodeSshChannelExtendedData(args: {
  recipientChannel: number;
  dataTypeCode: number;
  data: Uint8Array;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_EXTENDED_DATA)
    .writeUint32(args.recipientChannel)
    .writeUint32(args.dataTypeCode)
    .writeString(args.data)
    .toBuffer();
}

export interface SshChannelExtendedDataMessage {
  recipientChannel: number;
  dataTypeCode: number;
  data: Buffer;
}

export function decodeSshChannelExtendedData(payload: Uint8Array): SshChannelExtendedDataMessage {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_EXTENDED_DATA) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_EXTENDED_DATA",
      protocol: "sftp",
      retryable: false,
    });
  }
  const recipientChannel = reader.readUint32();
  const dataTypeCode = reader.readUint32();
  const data = reader.readString();
  return { data, dataTypeCode, recipientChannel };
}

// -- CHANNEL_WINDOW_ADJUST -----------------------------------------------------

export function encodeSshChannelWindowAdjust(args: {
  recipientChannel: number;
  bytesToAdd: number;
}): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_WINDOW_ADJUST)
    .writeUint32(args.recipientChannel)
    .writeUint32(args.bytesToAdd)
    .toBuffer();
}

export interface SshChannelWindowAdjustMessage {
  recipientChannel: number;
  bytesToAdd: number;
}

export function decodeSshChannelWindowAdjust(payload: Uint8Array): SshChannelWindowAdjustMessage {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_WINDOW_ADJUST) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_WINDOW_ADJUST",
      protocol: "sftp",
      retryable: false,
    });
  }
  const recipientChannel = reader.readUint32();
  const bytesToAdd = reader.readUint32();
  return { bytesToAdd, recipientChannel };
}

// -- CHANNEL_EOF / CHANNEL_CLOSE -----------------------------------------------

export function encodeSshChannelEof(recipientChannel: number): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_EOF)
    .writeUint32(recipientChannel)
    .toBuffer();
}

export function encodeSshChannelClose(recipientChannel: number): Buffer {
  return new SshDataWriter()
    .writeByte(SSH_MSG_CHANNEL_CLOSE)
    .writeUint32(recipientChannel)
    .toBuffer();
}
