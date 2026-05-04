/**
 * Unit tests for SSH connection protocol message codecs (RFC 4254).
 */
import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  SSH_MSG_CHANNEL_CLOSE,
  SSH_MSG_CHANNEL_DATA,
  SSH_MSG_CHANNEL_EOF,
  SSH_MSG_CHANNEL_EXTENDED_DATA,
  SSH_MSG_CHANNEL_FAILURE,
  SSH_MSG_CHANNEL_OPEN,
  SSH_MSG_CHANNEL_OPEN_CONFIRMATION,
  SSH_MSG_CHANNEL_OPEN_FAILURE,
  SSH_MSG_CHANNEL_REQUEST,
  SSH_MSG_CHANNEL_SUCCESS,
  SSH_MSG_CHANNEL_WINDOW_ADJUST,
  SSH_EXTENDED_DATA_STDERR,
  decodeSshChannelData,
  decodeSshChannelExtendedData,
  decodeSshChannelOpenConfirmation,
  decodeSshChannelOpenFailure,
  decodeSshChannelWindowAdjust,
  encodeSshChannelClose,
  encodeSshChannelData,
  encodeSshChannelEof,
  encodeSshChannelExtendedData,
  encodeSshChannelFailure,
  encodeSshChannelOpen,
  encodeSshChannelRequestEnv,
  encodeSshChannelRequestExec,
  encodeSshChannelRequestSignal,
  encodeSshChannelRequestSubsystem,
  encodeSshChannelSuccess,
  encodeSshChannelWindowAdjust,
} from "../../../../src/protocols/ssh/connection/SshConnectionMessages";
import { SshDataReader } from "../../../../src/protocols/ssh/binary/SshDataReader";
import { ParseError } from "../../../../src/errors/ZeroTransferError";

describe("SSH connection protocol message codecs", () => {
  // -- CHANNEL_OPEN ----------------------------------------------------------

  describe("encodeSshChannelOpen", () => {
    it("encodes channel open with correct fields", () => {
      const buf = encodeSshChannelOpen({
        channelType: "session",
        initialWindowSize: 131072,
        maxPacketSize: 32768,
        senderChannel: 0,
      });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_OPEN);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readString().toString("ascii")).toBe("session");
      expect(reader.readUint32()).toBe(0); // senderChannel
      expect(reader.readUint32()).toBe(131072); // initialWindowSize
      expect(reader.readUint32()).toBe(32768); // maxPacketSize
    });
  });

  // -- CHANNEL_OPEN_CONFIRMATION ---------------------------------------------

  describe("decodeSshChannelOpenConfirmation", () => {
    it("decodes confirmation payload", () => {
      const payload = Buffer.allocUnsafe(1 + 4 * 4);
      payload[0] = SSH_MSG_CHANNEL_OPEN_CONFIRMATION;
      payload.writeUInt32BE(0, 1); // recipientChannel
      payload.writeUInt32BE(1, 5); // senderChannel
      payload.writeUInt32BE(65536, 9); // initialWindowSize
      payload.writeUInt32BE(16384, 13); // maxPacketSize

      const result = decodeSshChannelOpenConfirmation(payload);
      expect(result.recipientChannel).toBe(0);
      expect(result.senderChannel).toBe(1);
      expect(result.initialWindowSize).toBe(65536);
      expect(result.maxPacketSize).toBe(16384);
    });

    it("throws on wrong message type", () => {
      const payload = Buffer.alloc(17);
      payload[0] = SSH_MSG_CHANNEL_OPEN_FAILURE;
      expect(() => decodeSshChannelOpenConfirmation(payload)).toThrowError(ParseError);
    });
  });

  // -- CHANNEL_OPEN_FAILURE --------------------------------------------------

  describe("decodeSshChannelOpenFailure", () => {
    it("decodes failure payload with reason code and description", () => {
      const desc = Buffer.from("Administratively prohibited", "utf8");
      const lang = Buffer.from("en", "ascii");
      const payload = Buffer.allocUnsafe(1 + 4 + 4 + 4 + desc.length + 4 + lang.length);
      let off = 0;
      payload[off++] = SSH_MSG_CHANNEL_OPEN_FAILURE;
      payload.writeUInt32BE(3, off);
      off += 4; // recipientChannel
      payload.writeUInt32BE(1, off);
      off += 4; // reasonCode (ADMINISTRATIVELY_PROHIBITED)
      payload.writeUInt32BE(desc.length, off);
      off += 4;
      desc.copy(payload, off);
      off += desc.length;
      payload.writeUInt32BE(lang.length, off);
      off += 4;
      lang.copy(payload, off);

      const result = decodeSshChannelOpenFailure(payload);
      expect(result.recipientChannel).toBe(3);
      expect(result.reasonCode).toBe(1);
      expect(result.description).toBe("Administratively prohibited");
      expect(result.languageTag).toBe("en");
    });
  });

  // -- CHANNEL_REQUEST (subsystem) -------------------------------------------

  describe("encodeSshChannelRequestSubsystem", () => {
    it("encodes a subsystem request with want-reply=true", () => {
      const buf = encodeSshChannelRequestSubsystem({
        recipientChannel: 0,
        subsystemName: "sftp",
        wantReply: true,
      });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readUint32()).toBe(0);
      expect(reader.readString().toString("ascii")).toBe("subsystem");
      expect(reader.readBoolean()).toBe(true);
      expect(reader.readString().toString("ascii")).toBe("sftp");
    });
  });

  describe("encodeSshChannelRequestExec", () => {
    it("encodes an exec request", () => {
      const buf = encodeSshChannelRequestExec({
        command: "ls -la",
        recipientChannel: 2,
        wantReply: true,
      });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readUint32()).toBe(2);
      expect(reader.readString().toString("ascii")).toBe("exec");
      expect(reader.readBoolean()).toBe(true);
      expect(reader.readString().toString("utf8")).toBe("ls -la");
    });
  });

  describe("encodeSshChannelRequestEnv", () => {
    it("encodes an env request", () => {
      const buf = encodeSshChannelRequestEnv({
        recipientChannel: 0,
        variableName: "LANG",
        variableValue: "en_US.UTF-8",
        wantReply: false,
      });
      const reader = new SshDataReader(buf.subarray(1));
      reader.readUint32();
      expect(reader.readString().toString("ascii")).toBe("env");
      expect(reader.readBoolean()).toBe(false);
      expect(reader.readString().toString("utf8")).toBe("LANG");
      expect(reader.readString().toString("utf8")).toBe("en_US.UTF-8");
    });
  });

  describe("encodeSshChannelRequestSignal", () => {
    it("encodes a signal request with want-reply=false", () => {
      const buf = encodeSshChannelRequestSignal({
        recipientChannel: 0,
        signalName: "KILL",
      });
      const reader = new SshDataReader(buf.subarray(1));
      reader.readUint32();
      reader.readString(); // "signal"
      expect(reader.readBoolean()).toBe(false); // RFC 4254 §6.9 says false
      expect(reader.readString().toString("ascii")).toBe("KILL");
    });
  });

  // -- CHANNEL_SUCCESS / CHANNEL_FAILURE -------------------------------------

  describe("encodeSshChannelSuccess / encodeSshChannelFailure", () => {
    it("encodes success with correct message type and channel id", () => {
      const buf = encodeSshChannelSuccess(7);
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_SUCCESS);
      expect(buf.readUInt32BE(1)).toBe(7);
    });

    it("encodes failure with correct message type and channel id", () => {
      const buf = encodeSshChannelFailure(3);
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_FAILURE);
      expect(buf.readUInt32BE(1)).toBe(3);
    });
  });

  // -- CHANNEL_DATA ----------------------------------------------------------

  describe("encodeSshChannelData / decodeSshChannelData", () => {
    it("round-trips channel data", () => {
      const data = Buffer.from("hello SFTP");
      const buf = encodeSshChannelData({ data, recipientChannel: 5 });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_DATA);

      const decoded = decodeSshChannelData(buf);
      expect(decoded.recipientChannel).toBe(5);
      expect(decoded.data).toEqual(data);
    });

    it("throws on wrong message type", () => {
      const buf = encodeSshChannelExtendedData({
        data: Buffer.from("err"),
        dataTypeCode: SSH_EXTENDED_DATA_STDERR,
        recipientChannel: 0,
      });
      expect(() => decodeSshChannelData(buf)).toThrowError(ParseError);
    });
  });

  // -- CHANNEL_EXTENDED_DATA -------------------------------------------------

  describe("encodeSshChannelExtendedData / decodeSshChannelExtendedData", () => {
    it("round-trips extended channel data", () => {
      const data = Buffer.from("stderr output");
      const buf = encodeSshChannelExtendedData({
        data,
        dataTypeCode: SSH_EXTENDED_DATA_STDERR,
        recipientChannel: 1,
      });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_EXTENDED_DATA);

      const decoded = decodeSshChannelExtendedData(buf);
      expect(decoded.recipientChannel).toBe(1);
      expect(decoded.dataTypeCode).toBe(SSH_EXTENDED_DATA_STDERR);
      expect(decoded.data).toEqual(data);
    });
  });

  // -- CHANNEL_WINDOW_ADJUST -------------------------------------------------

  describe("encodeSshChannelWindowAdjust / decodeSshChannelWindowAdjust", () => {
    it("round-trips window adjust", () => {
      const buf = encodeSshChannelWindowAdjust({ bytesToAdd: 65536, recipientChannel: 0 });
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_WINDOW_ADJUST);

      const decoded = decodeSshChannelWindowAdjust(buf);
      expect(decoded.recipientChannel).toBe(0);
      expect(decoded.bytesToAdd).toBe(65536);
    });
  });

  // -- CHANNEL_EOF / CHANNEL_CLOSE -------------------------------------------

  describe("encodeSshChannelEof / encodeSshChannelClose", () => {
    it("encodes EOF with correct type and channel id", () => {
      const buf = encodeSshChannelEof(4);
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_EOF);
      expect(buf.readUInt32BE(1)).toBe(4);
    });

    it("encodes CLOSE with correct type and channel id", () => {
      const buf = encodeSshChannelClose(4);
      expect(buf[0]).toBe(SSH_MSG_CHANNEL_CLOSE);
      expect(buf.readUInt32BE(1)).toBe(4);
    });
  });
});
