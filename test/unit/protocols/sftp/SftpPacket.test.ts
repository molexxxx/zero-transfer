import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../src/errors/ZeroTransferError";
import {
  SFTP_PACKET_TYPE,
  SftpPacketFramer,
  decodeSftpPacket,
  encodeSftpPacket,
} from "../../../../src/protocols/sftp/v3";

describe("SFTP packet framing", () => {
  it("encodes and decodes a packet", () => {
    const frame = encodeSftpPacket({
      payload: Buffer.from([0x00, 0x00, 0x00, 0x03]),
      type: SFTP_PACKET_TYPE.VERSION,
    });

    const decoded = decodeSftpPacket(frame);
    expect(decoded.type).toBe(SFTP_PACKET_TYPE.VERSION);
    expect(decoded.payload).toEqual(Buffer.from([0x00, 0x00, 0x00, 0x03]));
  });

  it("decodes packets across fragmented chunks", () => {
    const packetA = encodeSftpPacket({ payload: Buffer.from([1, 2, 3]), type: 101 });
    const packetB = encodeSftpPacket({ payload: Buffer.from([4, 5]), type: 103 });
    const combined = Buffer.concat([packetA, packetB]);

    const framer = new SftpPacketFramer();
    expect(framer.push(combined.subarray(0, 2))).toEqual([]);
    expect(framer.push(combined.subarray(2, 9))).toHaveLength(1);

    const finalPackets = framer.push(combined.subarray(9));
    expect(finalPackets).toHaveLength(1);
    expect(finalPackets.map((packet) => packet.type)).toEqual([103]);
    expect(framer.getBufferedByteLength()).toBe(0);
  });

  it("rejects packets with invalid frame length", () => {
    const badFrame = Buffer.from([0, 0, 0, 8, SFTP_PACKET_TYPE.STATUS, 1, 2]);
    expect(() => decodeSftpPacket(badFrame)).toThrow(ParseError);
  });
});
