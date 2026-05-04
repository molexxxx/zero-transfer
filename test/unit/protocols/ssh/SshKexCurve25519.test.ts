import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ConfigurationError, ParseError } from "../../../../src/errors/ZeroTransferError";
import {
  createCurve25519Ephemeral,
  decodeSshKexEcdhInitMessage,
  decodeSshKexEcdhReplyMessage,
  encodeSshKexEcdhInitMessage,
  encodeSshKexEcdhReplyMessage,
} from "../../../../src/protocols/ssh/transport";

describe("Curve25519 SSH key exchange helpers", () => {
  it("derives matching shared secrets from exchanged public keys", () => {
    const client = createCurve25519Ephemeral();
    const server = createCurve25519Ephemeral();

    const clientSecret = client.deriveSharedSecret(server.publicKey);
    const serverSecret = server.deriveSharedSecret(client.publicKey);

    expect(clientSecret.equals(serverSecret)).toBe(true);
    expect(clientSecret.length).toBe(32);
  });

  it("round-trips ECDH init and reply messages", () => {
    const client = createCurve25519Ephemeral();
    const server = createCurve25519Ephemeral();

    const init = decodeSshKexEcdhInitMessage(encodeSshKexEcdhInitMessage(client.publicKey));
    expect(init.clientPublicKey).toEqual(client.publicKey);

    const replyPayload = encodeSshKexEcdhReplyMessage({
      hostKey: Buffer.from("host-key"),
      serverPublicKey: server.publicKey,
      signature: Buffer.from("signature"),
    });
    const reply = decodeSshKexEcdhReplyMessage(replyPayload);

    expect(reply.serverPublicKey).toEqual(server.publicKey);
    expect(reply.hostKey.toString("utf8")).toBe("host-key");
    expect(reply.signature.toString("utf8")).toBe("signature");
  });

  it("rejects invalid key sizes and wrong message types", () => {
    expect(() => encodeSshKexEcdhInitMessage(Buffer.alloc(31))).toThrow(ConfigurationError);

    const badInit = Buffer.from([31, 0, 0, 0, 1, 0xff]);
    expect(() => decodeSshKexEcdhInitMessage(badInit)).toThrow(ParseError);
  });
});
