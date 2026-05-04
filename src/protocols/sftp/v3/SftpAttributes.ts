/**
 * SFTP v3 file attribute encoding and decoding (draft-ietf-secsh-filexfer-02 §5).
 *
 * ATTRS flags:
 *   SSH_FILEXFER_ATTR_SIZE        0x00000001
 *   SSH_FILEXFER_ATTR_UIDGID      0x00000002
 *   SSH_FILEXFER_ATTR_PERMISSIONS 0x00000004
 *   SSH_FILEXFER_ATTR_ACMODTIME   0x00000008
 *   SSH_FILEXFER_ATTR_EXTENDED    0x80000000
 */
import type { Buffer } from "node:buffer";
import { SshDataReader } from "../../ssh/binary/SshDataReader";
import { SshDataWriter } from "../../ssh/binary/SshDataWriter";

// -- Attribute flag constants -------------------------------------------------

export const SFTP_ATTR_FLAG = {
  SIZE: 0x00000001,
  UIDGID: 0x00000002,
  PERMISSIONS: 0x00000004,
  ACMODTIME: 0x00000008,
  EXTENDED: 0x80000000,
} as const;

// -- Attribute type ------------------------------------------------------------

export interface SftpFileAttributes {
  /** File size in bytes. Present when SFTP_ATTR_FLAG.SIZE is set. */
  size?: bigint;
  /** User id. Present when SFTP_ATTR_FLAG.UIDGID is set. */
  uid?: number;
  /** Group id. Present when SFTP_ATTR_FLAG.UIDGID is set. */
  gid?: number;
  /** POSIX file permissions (octal mode). Present when SFTP_ATTR_FLAG.PERMISSIONS is set. */
  permissions?: number;
  /** Access time (seconds since Unix epoch). Present when SFTP_ATTR_FLAG.ACMODTIME is set. */
  atime?: number;
  /** Modification time (seconds since Unix epoch). Present when SFTP_ATTR_FLAG.ACMODTIME is set. */
  mtime?: number;
  /**
   * Extended attributes as key-value pairs.
   * Present when SFTP_ATTR_FLAG.EXTENDED is set.
   */
  extended?: Array<{ type: string; data: Buffer }>;
}

// -- Encoder -------------------------------------------------------------------

/**
 * Encodes an `SftpFileAttributes` value into the SSH_FILEXFER_ATTR wire format.
 * Only fields that are present (non-undefined) are included; the flags word is
 * computed automatically.
 */
export function encodeSftpAttributes(attrs: SftpFileAttributes): Buffer {
  let flags = 0;
  if (attrs.size !== undefined) flags |= SFTP_ATTR_FLAG.SIZE;
  if (attrs.uid !== undefined || attrs.gid !== undefined) flags |= SFTP_ATTR_FLAG.UIDGID;
  if (attrs.permissions !== undefined) flags |= SFTP_ATTR_FLAG.PERMISSIONS;
  if (attrs.atime !== undefined || attrs.mtime !== undefined) flags |= SFTP_ATTR_FLAG.ACMODTIME;
  if (attrs.extended !== undefined && attrs.extended.length > 0) flags |= SFTP_ATTR_FLAG.EXTENDED;

  // >>> 0 forces unsigned 32-bit: required when the EXTENDED bit (0x80000000) is set
  // because JS bitwise ops produce signed int32, making the result negative.
  const writer = new SshDataWriter().writeUint32(flags >>> 0);

  if (flags & SFTP_ATTR_FLAG.SIZE) {
    // size is uint64 BE
    writer.writeUint64(attrs.size!);
  }

  if (flags & SFTP_ATTR_FLAG.UIDGID) {
    writer.writeUint32(attrs.uid ?? 0);
    writer.writeUint32(attrs.gid ?? 0);
  }

  if (flags & SFTP_ATTR_FLAG.PERMISSIONS) {
    writer.writeUint32(attrs.permissions!);
  }

  if (flags & SFTP_ATTR_FLAG.ACMODTIME) {
    writer.writeUint32(attrs.atime ?? 0);
    writer.writeUint32(attrs.mtime ?? 0);
  }

  if (flags & SFTP_ATTR_FLAG.EXTENDED) {
    const ext = attrs.extended!;
    writer.writeUint32(ext.length);
    for (const { type, data } of ext) {
      writer.writeString(type, "utf8");
      writer.writeString(data);
    }
  }

  return writer.toBuffer();
}

// -- Decoder -------------------------------------------------------------------

/**
 * Decodes an `SftpFileAttributes` from a streaming `SshDataReader`.
 * The reader is advanced past the entire attribute block.
 */
export function decodeSftpAttributesFromReader(reader: SshDataReader): SftpFileAttributes {
  const flags = reader.readUint32();
  const attrs: SftpFileAttributes = {};

  if (flags & SFTP_ATTR_FLAG.SIZE) {
    attrs.size = reader.readUint64();
  }

  if (flags & SFTP_ATTR_FLAG.UIDGID) {
    attrs.uid = reader.readUint32();
    attrs.gid = reader.readUint32();
  }

  if (flags & SFTP_ATTR_FLAG.PERMISSIONS) {
    attrs.permissions = reader.readUint32();
  }

  if (flags & SFTP_ATTR_FLAG.ACMODTIME) {
    attrs.atime = reader.readUint32();
    attrs.mtime = reader.readUint32();
  }

  if (flags & SFTP_ATTR_FLAG.EXTENDED) {
    const count = reader.readUint32();
    const extended: Array<{ type: string; data: Buffer }> = [];
    for (let i = 0; i < count; i++) {
      const type = reader.readString().toString("utf8");
      const data = reader.readString();
      extended.push({ data, type });
    }
    attrs.extended = extended;
  }

  return attrs;
}

/**
 * Decodes an `SftpFileAttributes` from a stand-alone Buffer (the entire buffer is consumed).
 */
export function decodeSftpAttributes(buf: Uint8Array): SftpFileAttributes {
  return decodeSftpAttributesFromReader(new SshDataReader(buf));
}
