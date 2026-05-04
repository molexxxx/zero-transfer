import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ProtocolError } from "../../../../src/errors/ZeroTransferError";
import {
  createSshTransportProtectionContext,
  deriveSshSessionKeys,
  type SshExchangeHashInput,
  type SshTransportPacketProtector,
  type SshTransportPacketUnprotector,
} from "../../../../src/protocols/ssh/transport";

function createCtrFixtureInput(): SshExchangeHashInput {
  return {
    clientIdentification: "SSH-2.0-ZeroTransfer_Test",
    clientKexInitPayload: Buffer.from("client-kexinit"),
    clientPublicKey: Buffer.alloc(32, 0x01),
    kexAlgorithm: "curve25519-sha256",
    negotiatedAlgorithms: {
      compressionClientToServer: "none",
      compressionServerToClient: "none",
      encryptionClientToServer: "aes256-ctr",
      encryptionServerToClient: "aes128-ctr",
      kexAlgorithm: "curve25519-sha256",
      macClientToServer: "hmac-sha2-512",
      macServerToClient: "hmac-sha2-256",
      serverHostKeyAlgorithm: "ssh-ed25519",
    },
    serverHostKey: Buffer.from("server-host-key"),
    serverIdentification: "SSH-2.0-OpenSSH_9.9",
    serverKexInitPayload: Buffer.from("server-kexinit"),
    serverPublicKey: Buffer.alloc(32, 0x02),
    sharedSecret: Buffer.alloc(32, 0x03),
  };
}

describe("SSH transport protection", () => {
  it("round-trips encrypted packets and advances sequence numbers", () => {
    const input = createCtrFixtureInput();
    const derived = deriveSshSessionKeys(input);
    const context = createSshTransportProtectionContext({
      deterministicPadding: true,
      keys: {
        clientToServer: derived.clientToServer,
        serverToClient: derived.serverToClient,
      },
      negotiatedAlgorithms: input.negotiatedAlgorithms,
    });

    const payload = Buffer.from([94, 1, 2, 3, 4, 5]);
    const protectedFrame = context.outbound.protectPayload(payload);

    // Receiver in this test uses the same direction keys to validate local roundtrip behavior.
    const localInbound = createSshTransportProtectionContext({
      deterministicPadding: true,
      keys: {
        clientToServer: derived.clientToServer,
        serverToClient: derived.clientToServer,
      },
      negotiatedAlgorithms: {
        ...input.negotiatedAlgorithms,
        encryptionServerToClient: input.negotiatedAlgorithms.encryptionClientToServer,
        macServerToClient: input.negotiatedAlgorithms.macClientToServer,
      },
    }).inbound;

    const decoded = localInbound.unprotectPayload(protectedFrame);
    expect(decoded).toEqual(payload);
    expect(context.outbound.getSequenceNumber()).toBe(1);
    expect(localInbound.getSequenceNumber()).toBe(1);
  });

  it("rejects packet tampering via MAC validation", () => {
    const input = createCtrFixtureInput();
    const derived = deriveSshSessionKeys(input);
    const outbound = createSshTransportProtectionContext({
      deterministicPadding: true,
      keys: {
        clientToServer: derived.clientToServer,
        serverToClient: derived.serverToClient,
      },
      negotiatedAlgorithms: input.negotiatedAlgorithms,
    }).outbound;

    const inbound = createSshTransportProtectionContext({
      deterministicPadding: true,
      keys: {
        clientToServer: derived.clientToServer,
        serverToClient: derived.clientToServer,
      },
      negotiatedAlgorithms: {
        ...input.negotiatedAlgorithms,
        encryptionServerToClient: input.negotiatedAlgorithms.encryptionClientToServer,
        macServerToClient: input.negotiatedAlgorithms.macClientToServer,
      },
    }).inbound;

    const protectedFrame = outbound.protectPayload(Buffer.from([98, 9, 8, 7]));
    const tamperIndex = protectedFrame.length - 1;
    protectedFrame[tamperIndex] = (protectedFrame[tamperIndex] ?? 0) ^ 0xff;

    expect(() => inbound.unprotectPayload(protectedFrame)).toThrow(ProtocolError);
  });
});

describe("SshTransportPacketUnprotector.pushBytes (streaming framing)", () => {
  function makePair(
    encryptionAlgorithm = "aes256-ctr",
    macAlgorithm = "hmac-sha2-512",
  ): {
    protector: SshTransportPacketProtector;
    unprotector: SshTransportPacketUnprotector;
  } {
    const input = createCtrFixtureInput();
    const derived = deriveSshSessionKeys({
      ...input,
      negotiatedAlgorithms: {
        ...input.negotiatedAlgorithms,
        encryptionClientToServer: encryptionAlgorithm,
        macClientToServer: macAlgorithm,
      },
    });
    const ctx = createSshTransportProtectionContext({
      deterministicPadding: true,
      keys: {
        clientToServer: derived.clientToServer,
        serverToClient: derived.clientToServer,
      },
      negotiatedAlgorithms: {
        ...input.negotiatedAlgorithms,
        encryptionClientToServer: encryptionAlgorithm,
        encryptionServerToClient: encryptionAlgorithm,
        macClientToServer: macAlgorithm,
        macServerToClient: macAlgorithm,
      },
    });
    return { protector: ctx.outbound, unprotector: ctx.inbound };
  }

  it("decodes a single encrypted packet delivered all at once", () => {
    const { protector, unprotector } = makePair();
    const payload = Buffer.from([1, 2, 3, 4, 5, 6]);
    const frame = protector.protectPayload(payload);

    const results = unprotector.pushBytes(frame);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(payload);
  });

  it("decodes a packet split across multiple pushBytes calls (byte-by-byte delivery)", () => {
    const { protector, unprotector } = makePair();
    const payload = Buffer.from([10, 20, 30]);
    const frame = protector.protectPayload(payload);

    const results: Buffer[] = [];
    for (const byte of frame) {
      results.push(...unprotector.pushBytes(Buffer.from([byte])));
    }

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(payload);
  });

  it("decodes multiple packets concatenated into one pushBytes call", () => {
    const { protector, unprotector } = makePair();
    const p1 = Buffer.from([1, 1, 1]);
    const p2 = Buffer.from([2, 2, 2]);
    const p3 = Buffer.from([3, 3, 3]);

    const combined = Buffer.concat([
      protector.protectPayload(p1),
      protector.protectPayload(p2),
      protector.protectPayload(p3),
    ]);

    const results = unprotector.pushBytes(combined);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual(p1);
    expect(results[1]).toEqual(p2);
    expect(results[2]).toEqual(p3);
  });

  it("throws ProtocolError on MAC tampering", () => {
    const { protector, unprotector } = makePair();
    const frame = protector.protectPayload(Buffer.from([7, 8, 9]));
    const idx = frame.length - 1;
    frame[idx] = (frame[idx] ?? 0) ^ 0xff;

    expect(() => unprotector.pushBytes(frame)).toThrow(ProtocolError);
  });
});
