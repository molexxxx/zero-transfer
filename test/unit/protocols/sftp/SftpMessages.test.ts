/**
 * Unit tests for SFTP v3 status codes, attributes, and message codecs.
 */
import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
} from "../../../../src/errors/ZeroTransferError";
import {
  SFTP_ATTR_FLAG,
  SFTP_OPEN_FLAG,
  SFTP_PACKET_TYPE,
  SFTP_STATUS,
  decodeSftpAttrsPayload,
  decodeSftpAttributesFromReader,
  decodeSftpDataPayload,
  decodeSftpHandlePayload,
  decodeSftpNamePayload,
  decodeSftpStatusPayload,
  decodeSftpVersion,
  encodeSftpAttributes,
  encodeSftpClose,
  encodeSftpInit,
  encodeSftpLstat,
  encodeSftpMkdir,
  encodeSftpOpen,
  encodeSftpRead,
  encodeSftpRealpath,
  encodeSftpRename,
  encodeSftpStat,
  encodeSftpWrite,
  sftpStatusToError,
  throwIfSftpError,
} from "../../../../src/protocols/sftp/v3";
import { SshDataReader } from "../../../../src/protocols/ssh/binary/SshDataReader";
import { SshDataWriter } from "../../../../src/protocols/ssh/binary/SshDataWriter";

// -- helpers -------------------------------------------------------------------

function encodeStr(s: string, encoding: BufferEncoding = "utf8"): Buffer {
  const b = Buffer.from(s, encoding);
  const out = Buffer.allocUnsafe(4 + b.length);
  out.writeUInt32BE(b.length, 0);
  b.copy(out, 4);
  return out;
}

function encodeU32(n: number): Buffer {
  const b = Buffer.allocUnsafe(4);
  b.writeUInt32BE(n, 0);
  return b;
}

// -- SFTP status ----------------------------------------------------------------

describe("SFTP status", () => {
  describe("decodeSftpStatusPayload", () => {
    it("decodes a status payload with all fields", () => {
      const payload = Buffer.concat([
        encodeU32(42), // requestId
        encodeU32(SFTP_STATUS.NO_SUCH_FILE), // statusCode
        encodeStr("No such file"), // errorMessage
        encodeStr("en"), // languageTag
      ]);
      const result = decodeSftpStatusPayload(payload);
      expect(result.requestId).toBe(42);
      expect(result.statusCode).toBe(SFTP_STATUS.NO_SUCH_FILE);
      expect(result.errorMessage).toBe("No such file");
      expect(result.languageTag).toBe("en");
    });

    it("handles a status payload without message or language tag", () => {
      const payload = Buffer.concat([encodeU32(1), encodeU32(SFTP_STATUS.OK)]);
      const result = decodeSftpStatusPayload(payload);
      expect(result.errorMessage).toBe("");
      expect(result.languageTag).toBe("");
    });
  });

  describe("sftpStatusToError", () => {
    it("returns null for OK", () => {
      expect(
        sftpStatusToError({
          requestId: 1,
          statusCode: SFTP_STATUS.OK,
          errorMessage: "",
          languageTag: "",
        }),
      ).toBeNull();
    });

    it("returns null for EOF", () => {
      expect(
        sftpStatusToError({
          requestId: 1,
          statusCode: SFTP_STATUS.EOF,
          errorMessage: "",
          languageTag: "",
        }),
      ).toBeNull();
    });

    it("returns PathNotFoundError for NO_SUCH_FILE", () => {
      const err = sftpStatusToError(
        {
          requestId: 1,
          statusCode: SFTP_STATUS.NO_SUCH_FILE,
          errorMessage: "not found",
          languageTag: "",
        },
        "/some/path",
      );
      expect(err).toBeInstanceOf(PathNotFoundError);
    });

    it("returns PermissionDeniedError for PERMISSION_DENIED", () => {
      const err = sftpStatusToError({
        requestId: 1,
        statusCode: SFTP_STATUS.PERMISSION_DENIED,
        errorMessage: "denied",
        languageTag: "",
      });
      expect(err).toBeInstanceOf(PermissionDeniedError);
    });
  });

  describe("throwIfSftpError", () => {
    it("does not throw for OK", () => {
      expect(() =>
        throwIfSftpError({
          requestId: 1,
          statusCode: SFTP_STATUS.OK,
          errorMessage: "",
          languageTag: "",
        }),
      ).not.toThrow();
    });

    it("throws for error status codes", () => {
      expect(() =>
        throwIfSftpError({
          requestId: 1,
          statusCode: SFTP_STATUS.NO_SUCH_FILE,
          errorMessage: "missing",
          languageTag: "",
        }),
      ).toThrowError(PathNotFoundError);
    });

    it("throws ProtocolError for unexpected EOF", () => {
      expect(() =>
        throwIfSftpError({
          requestId: 1,
          statusCode: SFTP_STATUS.EOF,
          errorMessage: "",
          languageTag: "",
        }),
      ).toThrowError(ProtocolError);
    });
  });
});

// -- SFTP attributes ------------------------------------------------------------

describe("SFTP attributes codec", () => {
  it("encodes and decodes empty attributes (flags = 0)", () => {
    const encoded = encodeSftpAttributes({});
    expect(encoded.readUInt32BE(0)).toBe(0);
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded).toEqual({});
  });

  it("encodes and decodes size", () => {
    const encoded = encodeSftpAttributes({ size: 1234567890n });
    expect(encoded.readUInt32BE(0) & SFTP_ATTR_FLAG.SIZE).toBeTruthy();
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded.size).toBe(1234567890n);
  });

  it("encodes and decodes uid/gid", () => {
    const encoded = encodeSftpAttributes({ uid: 1000, gid: 1001 });
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded.uid).toBe(1000);
    expect(decoded.gid).toBe(1001);
  });

  it("encodes and decodes permissions", () => {
    const encoded = encodeSftpAttributes({ permissions: 0o644 });
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded.permissions).toBe(0o644);
  });

  it("encodes and decodes atime and mtime", () => {
    const atime = 1700000000;
    const mtime = 1700001000;
    const encoded = encodeSftpAttributes({ atime, mtime });
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded.atime).toBe(atime);
    expect(decoded.mtime).toBe(mtime);
  });

  it("encodes and decodes all fields together", () => {
    const attrs = {
      size: 42n,
      uid: 0,
      gid: 0,
      permissions: 0o755,
      atime: 1000,
      mtime: 2000,
    };
    const encoded = encodeSftpAttributes(attrs);
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded).toEqual(attrs);
  });

  it("encodes and decodes extended attributes", () => {
    const extended = [{ type: "mime-type", data: Buffer.from("text/plain") }];
    const encoded = encodeSftpAttributes({ extended });
    const decoded = decodeSftpAttributesFromReader(new SshDataReader(encoded));
    expect(decoded.extended).toHaveLength(1);
    expect(decoded.extended?.[0]?.type).toBe("mime-type");
    expect(decoded.extended?.[0]?.data).toEqual(Buffer.from("text/plain"));
  });
});

// -- SFTP message encoders ------------------------------------------------------

describe("SFTP message encoders", () => {
  describe("encodeSftpInit", () => {
    it("encodes SSH_FXP_INIT with correct type byte and version", () => {
      const buf = encodeSftpInit(3);
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.INIT);
      expect(buf.readUInt32BE(1)).toBe(3);
    });
  });

  describe("encodeSftpOpen", () => {
    it("encodes SSH_FXP_OPEN with path, pflags, and empty attrs", () => {
      const buf = encodeSftpOpen({
        attrs: {},
        path: "/remote/file.txt",
        pflags: SFTP_OPEN_FLAG.READ,
        requestId: 1,
      });
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.OPEN);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readUint32()).toBe(1);
      expect(reader.readString().toString("utf8")).toBe("/remote/file.txt");
      expect(reader.readUint32()).toBe(SFTP_OPEN_FLAG.READ);
    });
  });

  describe("encodeSftpClose", () => {
    it("encodes SSH_FXP_CLOSE with handle", () => {
      const handle = Buffer.from("handle-bytes");
      const buf = encodeSftpClose(2, handle);
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.CLOSE);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readUint32()).toBe(2);
      expect(reader.readString()).toEqual(handle);
    });
  });

  describe("encodeSftpRead", () => {
    it("encodes SSH_FXP_READ with handle, offset, and length", () => {
      const handle = Buffer.from("fh");
      const buf = encodeSftpRead({ handle, length: 4096, offset: 1024n, requestId: 3 });
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.READ);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readUint32()).toBe(3);
      reader.readString(); // handle
      expect(reader.readUint64()).toBe(1024n);
      expect(reader.readUint32()).toBe(4096);
    });
  });

  describe("encodeSftpWrite", () => {
    it("encodes SSH_FXP_WRITE with handle, offset, and data", () => {
      const handle = Buffer.from("fh");
      const data = Buffer.from("hello");
      const buf = encodeSftpWrite({ data, handle, offset: 0n, requestId: 4 });
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.WRITE);
      const reader = new SshDataReader(buf.subarray(1));
      reader.readUint32(); // id
      reader.readString(); // handle
      reader.readUint64(); // offset
      expect(reader.readString()).toEqual(data);
    });
  });

  describe("encodeSftpStat / encodeSftpLstat", () => {
    it("encodes stat with correct type and path", () => {
      const buf = encodeSftpStat(5, "/test");
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.STAT);
      const r = new SshDataReader(buf.subarray(1));
      expect(r.readUint32()).toBe(5);
      expect(r.readString().toString("utf8")).toBe("/test");
    });

    it("encodes lstat with correct type", () => {
      expect(encodeSftpLstat(1, "/link")[0]).toBe(SFTP_PACKET_TYPE.LSTAT);
    });
  });

  describe("encodeSftpRealpath", () => {
    it("encodes realpath request", () => {
      const buf = encodeSftpRealpath(6, ".");
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.REALPATH);
      const r = new SshDataReader(buf.subarray(1));
      r.readUint32();
      expect(r.readString().toString("utf8")).toBe(".");
    });
  });

  describe("encodeSftpRename", () => {
    it("encodes both paths", () => {
      const buf = encodeSftpRename(7, "/old", "/new");
      const r = new SshDataReader(buf.subarray(1));
      r.readUint32();
      expect(r.readString().toString("utf8")).toBe("/old");
      expect(r.readString().toString("utf8")).toBe("/new");
    });
  });

  describe("encodeSftpMkdir", () => {
    it("encodes mkdir with path and attributes", () => {
      const buf = encodeSftpMkdir(8, "/newdir", { permissions: 0o755 });
      expect(buf[0]).toBe(SFTP_PACKET_TYPE.MKDIR);
      const r = new SshDataReader(buf.subarray(1));
      r.readUint32();
      expect(r.readString().toString("utf8")).toBe("/newdir");
      const flags = r.readUint32();
      expect(flags & SFTP_ATTR_FLAG.PERMISSIONS).toBeTruthy();
    });
  });
});

// -- SFTP response decoders -----------------------------------------------------

describe("SFTP response decoders", () => {
  describe("decodeSftpVersion", () => {
    it("decodes a VERSION payload with extensions", () => {
      const payload = Buffer.concat([
        encodeU32(3),
        encodeStr("hardlink@openssh.com"),
        encodeStr("1"),
      ]);
      const result = decodeSftpVersion(payload);
      expect(result.version).toBe(3);
      expect(result.extensions).toHaveLength(1);
      expect(result.extensions[0]?.name).toBe("hardlink@openssh.com");
    });

    it("decodes a VERSION payload without extensions", () => {
      const payload = encodeU32(3);
      expect(decodeSftpVersion(payload).extensions).toEqual([]);
    });
  });

  describe("decodeSftpHandlePayload", () => {
    it("decodes a handle response", () => {
      const handleBytes = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      // rebuild with correct encoding
      const w = new SshDataWriter().writeUint32(10).writeString(handleBytes);
      const result = decodeSftpHandlePayload(w.toBuffer());
      expect(result.requestId).toBe(10);
      expect(result.handle).toEqual(handleBytes);
    });
  });

  describe("decodeSftpDataPayload", () => {
    it("decodes a data response", () => {
      const data = Buffer.from("file contents");
      const w = new SshDataWriter().writeUint32(11).writeString(data);
      const result = decodeSftpDataPayload(w.toBuffer());
      expect(result.requestId).toBe(11);
      expect(result.data).toEqual(data);
    });
  });

  describe("decodeSftpNamePayload", () => {
    it("decodes a NAME response with one entry", () => {
      // Build: requestId + count + filename + longname + empty attrs
      const emptyAttrs = encodeSftpAttributes({});
      const payload = Buffer.concat([
        encodeU32(12), // requestId
        encodeU32(1), // count
        encodeStr("/home/bob"), // filename
        encodeStr("drwxr-xr-x 1 bob  bob  0 Jan  1 00:00 ."), // longname
        emptyAttrs,
      ]);
      const result = decodeSftpNamePayload(payload);
      expect(result.requestId).toBe(12);
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]?.filename).toBe("/home/bob");
    });
  });

  describe("decodeSftpAttrsPayload", () => {
    it("decodes an ATTRS response", () => {
      const attrsBytes = encodeSftpAttributes({ permissions: 0o644, size: 100n });
      const payload = Buffer.concat([encodeU32(13), attrsBytes]);
      const result = decodeSftpAttrsPayload(payload);
      expect(result.requestId).toBe(13);
      expect(result.attrs.permissions).toBe(0o644);
      expect(result.attrs.size).toBe(100n);
    });
  });
});
