import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  deriveSshSessionKeys,
  type SshExchangeHashInput,
} from "../../../../src/protocols/ssh/transport";

describe("deriveSshSessionKeys", () => {
  it("derives deterministic key material for CTR plus HMAC modes", () => {
    const input: SshExchangeHashInput = {
      clientIdentification: "SSH-2.0-ZeroTransfer_Test",
      clientKexInitPayload: Buffer.from("client-kexinit"),
      clientPublicKey: Buffer.alloc(32, 0x11),
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
      serverPublicKey: Buffer.alloc(32, 0x22),
      sharedSecret: Buffer.alloc(32, 0x33),
    };

    const a = deriveSshSessionKeys(input);
    const b = deriveSshSessionKeys(input);

    expect(a.exchangeHash.equals(b.exchangeHash)).toBe(true);
    expect(a.sessionId.equals(a.exchangeHash)).toBe(true);

    expect(a.clientToServer.iv.length).toBe(16);
    expect(a.clientToServer.encryptionKey.length).toBe(32);
    expect(a.clientToServer.macKey.length).toBe(64);

    expect(a.serverToClient.iv.length).toBe(16);
    expect(a.serverToClient.encryptionKey.length).toBe(16);
    expect(a.serverToClient.macKey.length).toBe(32);
  });

  it("omits MAC keys for AEAD modes", () => {
    const input: SshExchangeHashInput = {
      clientIdentification: "SSH-2.0-ZeroTransfer_Test",
      clientKexInitPayload: Buffer.from("client-kexinit"),
      clientPublicKey: Buffer.alloc(32, 0x44),
      kexAlgorithm: "curve25519-sha256@libssh.org",
      negotiatedAlgorithms: {
        compressionClientToServer: "none",
        compressionServerToClient: "none",
        encryptionClientToServer: "chacha20-poly1305@openssh.com",
        encryptionServerToClient: "aes256-gcm@openssh.com",
        kexAlgorithm: "curve25519-sha256@libssh.org",
        macClientToServer: "hmac-sha2-512",
        macServerToClient: "hmac-sha2-256",
        serverHostKeyAlgorithm: "ssh-ed25519",
      },
      serverHostKey: Buffer.from("host"),
      serverIdentification: "SSH-2.0-OpenSSH_9.9",
      serverKexInitPayload: Buffer.from("server-kexinit"),
      serverPublicKey: Buffer.alloc(32, 0x55),
      sharedSecret: Buffer.alloc(32, 0x66),
    };

    const derived = deriveSshSessionKeys(input);
    expect(derived.clientToServer.encryptionKey.length).toBe(64);
    expect(derived.clientToServer.iv.length).toBe(0);
    expect(derived.clientToServer.macKey.length).toBe(0);

    expect(derived.serverToClient.encryptionKey.length).toBe(32);
    expect(derived.serverToClient.iv.length).toBe(12);
    expect(derived.serverToClient.macKey.length).toBe(0);
  });
});
