import { Buffer } from "node:buffer";
import { generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ProtocolError } from "../../../../src/errors/ZeroTransferError";
import {
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  SshTransportHandshake,
  createCurve25519Ephemeral,
  decodeSshKexEcdhInitMessage,
  decodeSshKexInitMessage,
  encodeSshKexEcdhReplyMessage,
  encodeSshNewKeysMessage,
  decodeSshTransportPacket,
  encodeSshKexInitMessage,
  encodeSshTransportPacket,
  deriveSshSessionKeys,
} from "../../../../src/protocols/ssh/transport";
import { SshDataWriter } from "../../../../src/protocols/ssh/binary/SshDataWriter";

describe("SshTransportHandshake", () => {
  it("exchanges identification and negotiates algorithms on server KEXINIT", () => {
    const handshake = new SshTransportHandshake({
      clientSoftwareVersion: "ZeroTransfer_Test",
      kexCookie: Buffer.alloc(16, 0x11),
    });

    const initial = handshake.createInitialClientBytes();
    expect(initial.toString("ascii")).toBe("SSH-2.0-ZeroTransfer_Test\r\n");

    const serverAlgorithms = {
      ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
      encryptionClientToServer: ["aes256-ctr"],
      encryptionServerToClient: ["aes256-ctr"],
      kexAlgorithms: ["curve25519-sha256@libssh.org"],
      serverHostKeyAlgorithms: ["rsa-sha2-256", "ssh-ed25519"],
    };
    const serverKexInitFrame = encodeSshTransportPacket(
      encodeSshKexInitMessage({
        algorithms: serverAlgorithms,
        cookie: Buffer.alloc(16, 0x22),
      }),
      { randomPadding: false },
    );

    // Include a pre-identification banner and append part of KEXINIT in same chunk.
    const serverPrefix = Buffer.concat([
      Buffer.from("NOTICE maintenance window\r\nSSH-2.0-OpenSSH_9.9\r\n", "ascii"),
      serverKexInitFrame.subarray(0, 10),
    ]);

    const firstStep = handshake.pushServerBytes(serverPrefix);
    expect(firstStep.outbound).toHaveLength(1);

    const clientKexInitPacket = decodeSshTransportPacket(firstStep.outbound[0]!);
    const clientKexInit = decodeSshKexInitMessage(clientKexInitPacket.payload);
    expect(clientKexInit.messageType).toBe(20);
    expect(handshake.getServerBannerLines()).toEqual(["NOTICE maintenance window"]);

    const secondStep = handshake.pushServerBytes(serverKexInitFrame.subarray(10));
    expect(secondStep.result).toBeUndefined();
    expect(secondStep.outbound).toHaveLength(1);

    const clientEcdhPacket = decodeSshTransportPacket(secondStep.outbound[0]!);
    const clientEcdhInit = decodeSshKexEcdhInitMessage(clientEcdhPacket.payload);

    const serverCurve = createCurve25519Ephemeral();
    const serverSharedSecret = serverCurve.deriveSharedSecret(clientEcdhInit.clientPublicKey);

    // Build a real ed25519 host key blob and sign the exchange hash so the
    // handshake's host-key signature verification accepts the reply.
    const { privateKey: hostPriv, publicKey: hostPub } = generateKeyPairSync("ed25519");
    const hostPubRaw = Buffer.from(hostPub.export({ type: "spki", format: "der" })).subarray(-32);
    const hostKeyBlob = new SshDataWriter()
      .writeString("ssh-ed25519", "ascii")
      .writeString(hostPubRaw)
      .toBuffer();

    // Compute the exchange hash the same way the handshake will, so we can sign it.
    const negotiatedForHash = {
      compressionClientToServer: "none",
      compressionServerToClient: "none",
      encryptionClientToServer: "aes256-ctr",
      encryptionServerToClient: "aes256-ctr",
      kexAlgorithm: "curve25519-sha256@libssh.org",
      languagesClientToServer: "",
      languagesServerToClient: "",
      macClientToServer: "hmac-sha2-256",
      macServerToClient: "hmac-sha2-256",
      serverHostKeyAlgorithm: "ssh-ed25519",
    } as const;
    const derivedForSign = deriveSshSessionKeys({
      clientIdentification: "SSH-2.0-ZeroTransfer_Test",
      clientKexInitPayload: clientKexInitPacket.payload,
      clientPublicKey: clientEcdhInit.clientPublicKey,
      kexAlgorithm: "curve25519-sha256@libssh.org",
      negotiatedAlgorithms: negotiatedForHash,
      serverHostKey: hostKeyBlob,
      serverIdentification: "SSH-2.0-OpenSSH_9.9",
      serverKexInitPayload: encodeSshKexInitMessage({
        algorithms: serverAlgorithms,
        cookie: Buffer.alloc(16, 0x22),
      }),
      serverPublicKey: serverCurve.publicKey,
      sharedSecret: serverSharedSecret,
    });
    const sigBytes = cryptoSign(null, derivedForSign.exchangeHash, hostPriv);
    const signatureBlob = new SshDataWriter()
      .writeString("ssh-ed25519", "ascii")
      .writeString(sigBytes)
      .toBuffer();

    const serverReply = encodeSshTransportPacket(
      encodeSshKexEcdhReplyMessage({
        hostKey: hostKeyBlob,
        serverPublicKey: serverCurve.publicKey,
        signature: signatureBlob,
      }),
      { randomPadding: false },
    );

    const thirdStep = handshake.pushServerBytes(serverReply);
    expect(thirdStep.result).toBeUndefined();
    expect(thirdStep.outbound).toHaveLength(1);
    const clientNewKeys = decodeSshTransportPacket(thirdStep.outbound[0]!);
    expect(clientNewKeys.payload[0]).toBe(21);

    const fourthStep = handshake.pushServerBytes(
      encodeSshTransportPacket(encodeSshNewKeysMessage(), { randomPadding: false }),
    );

    expect(fourthStep.outbound).toEqual([]);
    expect(fourthStep.result).toBeDefined();
    expect(fourthStep.result?.serverIdentification.softwareVersion).toBe("OpenSSH_9.9");
    expect(fourthStep.result?.negotiatedAlgorithms.kexAlgorithm).toBe(
      "curve25519-sha256@libssh.org",
    );
    expect(fourthStep.result?.negotiatedAlgorithms.serverHostKeyAlgorithm).toBe("ssh-ed25519");
    expect(fourthStep.result?.keyExchange.sharedSecret.equals(serverSharedSecret)).toBe(true);
    expect(fourthStep.result?.keyExchange.exchangeHash.length).toBe(32);
    expect(
      fourthStep.result?.keyExchange.sessionId.equals(fourthStep.result.keyExchange.exchangeHash),
    ).toBe(true);
    expect(
      fourthStep.result?.keyExchange.transportKeys.clientToServer.encryptionKey.length,
    ).toBeGreaterThan(0);
    expect(
      fourthStep.result?.keyExchange.transportKeys.serverToClient.encryptionKey.length,
    ).toBeGreaterThan(0);
    expect(handshake.isComplete()).toBe(true);
  });

  it("fails when server sends a non-KEXINIT message during negotiation", () => {
    const handshake = new SshTransportHandshake();
    handshake.pushServerBytes(Buffer.from("SSH-2.0-OpenSSH_9.9\r\n", "ascii"));

    const wrongMessage = encodeSshTransportPacket(Buffer.from([21, 0x00]), {
      randomPadding: false,
    });

    expect(() => handshake.pushServerBytes(wrongMessage)).toThrow(ProtocolError);
  });
});
