import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../src/errors/ZeroTransferError";
import { SshDataReader, SshDataWriter } from "../../../../src/protocols/ssh/binary";

describe("SshDataWriter and SshDataReader", () => {
  it("round-trips common SSH primitive types", () => {
    const payload = new SshDataWriter()
      .writeByte(7)
      .writeBoolean(true)
      .writeUint32(1024)
      .writeUint64(1234567890123456789n)
      .writeString("hello")
      .writeNameList(["curve25519-sha256", "ssh-ed25519"])
      .toBuffer();

    const reader = new SshDataReader(payload);
    expect(reader.readByte()).toBe(7);
    expect(reader.readBoolean()).toBe(true);
    expect(reader.readUint32()).toBe(1024);
    expect(reader.readUint64()).toBe(1234567890123456789n);
    expect(reader.readUtf8String()).toBe("hello");
    expect(reader.readNameList()).toEqual(["curve25519-sha256", "ssh-ed25519"]);
    expect(() => reader.assertFinished()).not.toThrow();
  });

  it("throws on truncated payloads", () => {
    const payload = new SshDataWriter().writeString("abc").toBuffer().subarray(0, 6);
    const reader = new SshDataReader(payload);
    expect(() => reader.readString()).toThrow(ParseError);
  });

  it("encodes an empty name list as an empty SSH string", () => {
    const payload = new SshDataWriter().writeNameList([]).toBuffer();
    const reader = new SshDataReader(payload);
    expect(reader.readNameList()).toEqual([]);
    expect(() => reader.assertFinished()).not.toThrow();
  });

  it("encodes positive mpint values with sign-safe prefixing", () => {
    const payload = new SshDataWriter()
      .writeMpint(Buffer.from([0x00, 0x00, 0x7f]))
      .writeMpint(Buffer.from([0x80]))
      .writeMpint(Buffer.from([0x00]))
      .toBuffer();
    const reader = new SshDataReader(payload);

    expect(reader.readUint32()).toBe(1);
    expect(reader.readBytes(1)).toEqual(Buffer.from([0x7f]));

    expect(reader.readUint32()).toBe(2);
    expect(reader.readBytes(2)).toEqual(Buffer.from([0x00, 0x80]));

    expect(reader.readUint32()).toBe(0);
    expect(() => reader.assertFinished()).not.toThrow();
  });
});
