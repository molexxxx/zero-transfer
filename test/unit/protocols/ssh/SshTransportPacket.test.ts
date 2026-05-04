import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../src/errors/ZeroTransferError";
import {
  SshTransportPacketFramer,
  decodeSshTransportPacket,
  encodeSshTransportPacket,
} from "../../../../src/protocols/ssh/transport";

describe("SSH transport packet codec", () => {
  it("round-trips a clear transport packet", () => {
    const payload = Buffer.from([20, 1, 2, 3]);
    const frame = encodeSshTransportPacket(payload, { randomPadding: false });
    const decoded = decodeSshTransportPacket(frame);

    expect(decoded.payload).toEqual(payload);
    expect(decoded.paddingLength).toBeGreaterThanOrEqual(4);
    expect(decoded.padding.length).toBe(decoded.paddingLength);
  });

  it("frames packets across chunk boundaries", () => {
    const frameA = encodeSshTransportPacket(Buffer.from([20, 0xaa]), { randomPadding: false });
    const frameB = encodeSshTransportPacket(Buffer.from([21, 0xbb]), { randomPadding: false });
    const combined = Buffer.concat([frameA, frameB]);

    const framer = new SshTransportPacketFramer();
    expect(framer.push(combined.subarray(0, 3))).toEqual([]);

    const packets = framer.push(combined.subarray(3));
    expect(packets).toHaveLength(2);
    expect(packets.map((packet) => packet.payload[0])).toEqual([20, 21]);
    expect(framer.getBufferedByteLength()).toBe(0);
  });

  it("rejects invalid frames", () => {
    const frame = encodeSshTransportPacket(Buffer.from([20]), { randomPadding: false });
    const corrupted = Buffer.from(frame);
    corrupted.writeUInt32BE(1, 0);

    expect(() => decodeSshTransportPacket(corrupted)).toThrow(ParseError);
  });
});
