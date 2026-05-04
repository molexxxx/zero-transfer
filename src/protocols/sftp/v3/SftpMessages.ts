/**
 * SFTP v3 request and response message codecs (draft-ietf-secsh-filexfer-02).
 *
 * Each encode function produces the payload bytes that go inside an
 * SSH_FXP_* packet (the type byte and length prefix are added by the framer).
 *
 * Each decode function accepts the full framed packet payload (starting at the
 * byte immediately after the type byte, i.e. at request-id).
 */
import type { Buffer } from "node:buffer";
import { SshDataReader } from "../../ssh/binary/SshDataReader";
import { SshDataWriter } from "../../ssh/binary/SshDataWriter";
import {
  type SftpFileAttributes,
  decodeSftpAttributesFromReader,
  encodeSftpAttributes,
} from "./SftpAttributes";
import { SFTP_PACKET_TYPE } from "./SftpPacket";

export type { SftpFileAttributes };

// -- Open flags (SSH_FXF_*) ----------------------------------------------------

export const SFTP_OPEN_FLAG = {
  READ: 0x00000001,
  WRITE: 0x00000002,
  APPEND: 0x00000004,
  CREAT: 0x00000008,
  TRUNC: 0x00000010,
  EXCL: 0x00000020,
} as const;

// -- INIT / VERSION ------------------------------------------------------------

/** Encodes SSH_FXP_INIT payload. */
export function encodeSftpInit(version: number): Buffer {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.INIT).writeUint32(version).toBuffer();
}

export interface SftpVersionResponse {
  version: number;
  extensions: Array<{ name: string; data: string }>;
}

/** Decodes SSH_FXP_VERSION payload (type byte already consumed by framer). */
export function decodeSftpVersion(payload: Uint8Array): SftpVersionResponse {
  const reader = new SshDataReader(payload);
  const version = reader.readUint32();
  const extensions: Array<{ name: string; data: string }> = [];
  while (reader.hasMore()) {
    const name = reader.readString().toString("utf8");
    const data = reader.readString().toString("utf8");
    extensions.push({ data, name });
  }
  return { extensions, version };
}

// -- OPEN ----------------------------------------------------------------------

export interface SftpOpenArgs {
  requestId: number;
  path: string;
  pflags: number;
  attrs: SftpFileAttributes;
}

export function encodeSftpOpen(args: SftpOpenArgs): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.OPEN)
    .writeUint32(args.requestId)
    .writeString(args.path, "utf8")
    .writeUint32(args.pflags)
    .writeBytes(encodeSftpAttributes(args.attrs))
    .toBuffer();
}

// -- CLOSE ---------------------------------------------------------------------

export function encodeSftpClose(requestId: number, handle: Uint8Array): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.CLOSE)
    .writeUint32(requestId)
    .writeString(handle)
    .toBuffer();
}

// -- READ ----------------------------------------------------------------------

export interface SftpReadArgs {
  requestId: number;
  handle: Uint8Array;
  offset: bigint;
  length: number;
}

export function encodeSftpRead(args: SftpReadArgs): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.READ)
    .writeUint32(args.requestId)
    .writeString(args.handle)
    .writeUint64(args.offset)
    .writeUint32(args.length)
    .toBuffer();
}

// -- WRITE ---------------------------------------------------------------------

export interface SftpWriteArgs {
  requestId: number;
  handle: Uint8Array;
  offset: bigint;
  data: Uint8Array;
}

export function encodeSftpWrite(args: SftpWriteArgs): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.WRITE)
    .writeUint32(args.requestId)
    .writeString(args.handle)
    .writeUint64(args.offset)
    .writeString(args.data)
    .toBuffer();
}

// -- LSTAT / STAT / FSTAT ------------------------------------------------------

export function encodeSftpStat(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.STAT)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

export function encodeSftpLstat(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.LSTAT)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

export function encodeSftpFstat(requestId: number, handle: Uint8Array): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.FSTAT)
    .writeUint32(requestId)
    .writeString(handle)
    .toBuffer();
}

// -- SETSTAT / FSETSTAT --------------------------------------------------------

export function encodeSftpSetstat(
  requestId: number,
  path: string,
  attrs: SftpFileAttributes,
): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.SETSTAT)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .writeBytes(encodeSftpAttributes(attrs))
    .toBuffer();
}

export function encodeSftpFsetstat(
  requestId: number,
  handle: Uint8Array,
  attrs: SftpFileAttributes,
): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.FSETSTAT)
    .writeUint32(requestId)
    .writeString(handle)
    .writeBytes(encodeSftpAttributes(attrs))
    .toBuffer();
}

// -- OPENDIR -------------------------------------------------------------------

export function encodeSftpOpendir(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.OPENDIR)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

// -- READDIR -------------------------------------------------------------------

export function encodeSftpReaddir(requestId: number, handle: Uint8Array): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.READDIR)
    .writeUint32(requestId)
    .writeString(handle)
    .toBuffer();
}

// -- REMOVE --------------------------------------------------------------------

export function encodeSftpRemove(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.REMOVE)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

// -- MKDIR / RMDIR -------------------------------------------------------------

export function encodeSftpMkdir(
  requestId: number,
  path: string,
  attrs: SftpFileAttributes,
): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.MKDIR)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .writeBytes(encodeSftpAttributes(attrs))
    .toBuffer();
}

export function encodeSftpRmdir(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.RMDIR)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

// -- REALPATH ------------------------------------------------------------------

export function encodeSftpRealpath(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.REALPATH)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

// -- RENAME --------------------------------------------------------------------

export function encodeSftpRename(requestId: number, oldPath: string, newPath: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.RENAME)
    .writeUint32(requestId)
    .writeString(oldPath, "utf8")
    .writeString(newPath, "utf8")
    .toBuffer();
}

// -- READLINK / SYMLINK --------------------------------------------------------

export function encodeSftpReadlink(requestId: number, path: string): Buffer {
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.READLINK)
    .writeUint32(requestId)
    .writeString(path, "utf8")
    .toBuffer();
}

export function encodeSftpSymlink(requestId: number, linkPath: string, targetPath: string): Buffer {
  // OpenSSH reverses the argument order vs the draft; some servers expect
  // (targetPath, linkPath). We follow the draft (linkPath first).
  return new SshDataWriter()
    .writeByte(SFTP_PACKET_TYPE.SYMLINK)
    .writeUint32(requestId)
    .writeString(linkPath, "utf8")
    .writeString(targetPath, "utf8")
    .toBuffer();
}

// -- Response decoders ---------------------------------------------------------

/** SSH_FXP_HANDLE response. */
export interface SftpHandleResponse {
  requestId: number;
  handle: Buffer;
}

export function decodeSftpHandlePayload(payload: Uint8Array): SftpHandleResponse {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const handle = reader.readString();
  return { handle, requestId };
}

/** SSH_FXP_DATA response. */
export interface SftpDataResponse {
  requestId: number;
  data: Buffer;
}

export function decodeSftpDataPayload(payload: Uint8Array): SftpDataResponse {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const data = reader.readString();
  return { data, requestId };
}

/** A single entry returned by SSH_FXP_NAME. */
export interface SftpNameEntry {
  filename: string;
  longname: string;
  attrs: SftpFileAttributes;
}

/** SSH_FXP_NAME response (used for READDIR and REALPATH). */
export interface SftpNameResponse {
  requestId: number;
  entries: SftpNameEntry[];
}

export function decodeSftpNamePayload(payload: Uint8Array): SftpNameResponse {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const count = reader.readUint32();
  const entries: SftpNameEntry[] = [];
  for (let i = 0; i < count; i++) {
    const filename = reader.readString().toString("utf8");
    const longname = reader.readString().toString("utf8");
    const attrs = decodeSftpAttributesFromReader(reader);
    entries.push({ attrs, filename, longname });
  }
  return { entries, requestId };
}

/** SSH_FXP_ATTRS response. */
export interface SftpAttrsResponse {
  requestId: number;
  attrs: SftpFileAttributes;
}

export function decodeSftpAttrsPayload(payload: Uint8Array): SftpAttrsResponse {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const attrs = decodeSftpAttributesFromReader(reader);
  return { attrs, requestId };
}
