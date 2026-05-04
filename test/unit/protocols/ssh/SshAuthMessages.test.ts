/**
 * Unit tests for SSH authentication message codecs (RFC 4252).
 */
import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  SSH_MSG_SERVICE_ACCEPT,
  SSH_MSG_SERVICE_REQUEST,
  SSH_MSG_USERAUTH_BANNER,
  SSH_MSG_USERAUTH_FAILURE,
  SSH_MSG_USERAUTH_PK_OK,
  SSH_MSG_USERAUTH_REQUEST,
  SSH_MSG_USERAUTH_INFO_REQUEST,
  SSH_MSG_USERAUTH_INFO_RESPONSE,
  buildPublickeySignData,
  decodeSshServiceAccept,
  decodeSshUserauthBanner,
  decodeSshUserauthFailure,
  decodeSshUserauthInfoRequest,
  decodeSshUserauthPkOk,
  encodeUserauthRequestNone,
  encodeUserauthRequestPassword,
  encodeUserauthRequestPublickeyQuery,
  encodeUserauthRequestPublickeySign,
  encodeSshServiceRequest,
  encodeSshUserauthInfoResponse,
} from "../../../../src/protocols/ssh/auth/SshAuthMessages";
import { SshDataReader } from "../../../../src/protocols/ssh/binary/SshDataReader";
import { ParseError } from "../../../../src/errors/ZeroTransferError";

// -- service request / accept -------------------------------------------------

describe("SSH auth message codecs", () => {
  describe("encodeSshServiceRequest / decodeSshServiceAccept", () => {
    it("encodes a service request with the correct type byte and service name", () => {
      const buf = encodeSshServiceRequest("ssh-userauth");
      expect(buf[0]).toBe(SSH_MSG_SERVICE_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readString().toString("utf8")).toBe("ssh-userauth");
    });

    it("decodes a service accept payload", () => {
      // Build a minimal SERVICE_ACCEPT packet.
      const inner = Buffer.from("ssh-userauth", "utf8");
      const payload = Buffer.allocUnsafe(1 + 4 + inner.length);
      payload[0] = SSH_MSG_SERVICE_ACCEPT;
      payload.writeUInt32BE(inner.length, 1);
      inner.copy(payload, 5);

      const result = decodeSshServiceAccept(payload);
      expect(result.serviceName).toBe("ssh-userauth");
    });

    it("throws ParseError on wrong message type in decodeSshServiceAccept", () => {
      const payload = Buffer.from([SSH_MSG_SERVICE_REQUEST, 0, 0, 0, 0]);
      expect(() => decodeSshServiceAccept(payload)).toThrowError(ParseError);
    });
  });

  // -- userauth request: none -------------------------------------------------

  describe("encodeUserauthRequestNone", () => {
    it("encodes a none auth request with correct structure", () => {
      const buf = encodeUserauthRequestNone({
        serviceName: "ssh-connection",
        username: "alice",
      });
      expect(buf[0]).toBe(SSH_MSG_USERAUTH_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readString().toString("utf8")).toBe("alice");
      expect(reader.readString().toString("utf8")).toBe("ssh-connection");
      expect(reader.readString().toString("ascii")).toBe("none");
    });
  });

  // -- userauth request: password --------------------------------------------

  describe("encodeUserauthRequestPassword", () => {
    it("encodes a password auth request with change-password=false", () => {
      const buf = encodeUserauthRequestPassword({
        password: "s3cr3t",
        serviceName: "ssh-connection",
        username: "bob",
      });
      expect(buf[0]).toBe(SSH_MSG_USERAUTH_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readString().toString("utf8")).toBe("bob");
      expect(reader.readString().toString("utf8")).toBe("ssh-connection");
      expect(reader.readString().toString("ascii")).toBe("password");
      expect(reader.readBoolean()).toBe(false); // change-password flag
      expect(reader.readString().toString("utf8")).toBe("s3cr3t");
    });
  });

  // -- userauth request: publickey query -------------------------------------

  describe("encodeUserauthRequestPublickeyQuery", () => {
    it("encodes a publickey query with has-sig=false", () => {
      const pubKeyBlob = Buffer.from("pk-blob-bytes");
      const buf = encodeUserauthRequestPublickeyQuery({
        algorithmName: "ssh-ed25519",
        publicKeyBlob: pubKeyBlob,
        serviceName: "ssh-connection",
        username: "carol",
      });
      expect(buf[0]).toBe(SSH_MSG_USERAUTH_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      expect(reader.readString().toString("utf8")).toBe("carol");
      expect(reader.readString().toString("utf8")).toBe("ssh-connection");
      expect(reader.readString().toString("ascii")).toBe("publickey");
      expect(reader.readBoolean()).toBe(false); // has-sig flag
      expect(reader.readString().toString("ascii")).toBe("ssh-ed25519");
      expect(reader.readString()).toEqual(pubKeyBlob);
    });
  });

  // -- userauth request: publickey sign -------------------------------------

  describe("encodeUserauthRequestPublickeySign", () => {
    it("encodes a publickey sign request with has-sig=true and signature", () => {
      const pubKeyBlob = Buffer.from("pk-blob");
      const sigBlob = Buffer.from("sig-blob");
      const buf = encodeUserauthRequestPublickeySign({
        algorithmName: "rsa-sha2-256",
        publicKeyBlob: pubKeyBlob,
        serviceName: "ssh-connection",
        signature: sigBlob,
        username: "dave",
      });
      expect(buf[0]).toBe(SSH_MSG_USERAUTH_REQUEST);
      const reader = new SshDataReader(buf.subarray(1));
      reader.readString(); // username
      reader.readString(); // service
      reader.readString(); // method
      expect(reader.readBoolean()).toBe(true); // has-sig = true
      reader.readString(); // algorithm
      reader.readString(); // public key
      expect(reader.readString()).toEqual(sigBlob);
    });
  });

  // -- buildPublickeySignData ------------------------------------------------

  describe("buildPublickeySignData", () => {
    it("produces deterministic sign data from the same inputs", () => {
      const args = {
        algorithmName: "ssh-ed25519",
        publicKeyBlob: Buffer.from("pubkey"),
        serviceName: "ssh-connection",
        sessionId: Buffer.from("session-id"),
        username: "alice",
      };
      const a = buildPublickeySignData(args);
      const b = buildPublickeySignData(args);
      expect(a).toEqual(b);
    });

    it("starts with a length-prefixed session id", () => {
      const sessionId = Buffer.from("test-session-id");
      const buf = buildPublickeySignData({
        algorithmName: "ssh-ed25519",
        publicKeyBlob: Buffer.from("pk"),
        serviceName: "ssh-connection",
        sessionId,
        username: "alice",
      });
      // First 4 bytes = uint32 length of session id
      const idLen = buf.readUInt32BE(0);
      expect(idLen).toBe(sessionId.length);
      expect(buf.subarray(4, 4 + idLen)).toEqual(sessionId);
      // Next byte should be SSH_MSG_USERAUTH_REQUEST
      expect(buf[4 + idLen]).toBe(SSH_MSG_USERAUTH_REQUEST);
    });
  });

  // -- decodeSshUserauthFailure ----------------------------------------------

  describe("decodeSshUserauthFailure", () => {
    it("decodes allowed authentication methods and partial success flag", () => {
      const methods = "password,publickey";
      const methodBuf = Buffer.from(methods, "ascii");
      const payload = Buffer.allocUnsafe(1 + 4 + methodBuf.length + 1);
      payload[0] = SSH_MSG_USERAUTH_FAILURE;
      payload.writeUInt32BE(methodBuf.length, 1);
      methodBuf.copy(payload, 5);
      payload[5 + methodBuf.length] = 0; // partial-success = false

      const result = decodeSshUserauthFailure(payload);
      expect(result.allowedAuthentications).toEqual(["password", "publickey"]);
      expect(result.partialSuccess).toBe(false);
    });

    it("parses an empty method list", () => {
      const payload = Buffer.from([SSH_MSG_USERAUTH_FAILURE, 0, 0, 0, 0, 0]);
      const result = decodeSshUserauthFailure(payload);
      expect(result.allowedAuthentications).toEqual([]);
    });

    it("throws ParseError on wrong message type", () => {
      const payload = Buffer.from([SSH_MSG_USERAUTH_REQUEST, 0, 0, 0, 0, 0]);
      expect(() => decodeSshUserauthFailure(payload)).toThrowError(ParseError);
    });
  });

  // -- decodeSshUserauthBanner -----------------------------------------------

  describe("decodeSshUserauthBanner", () => {
    it("decodes banner message and language tag", () => {
      const msg = Buffer.from("Welcome!\n", "utf8");
      const lang = Buffer.from("en-US", "ascii");
      const payload = Buffer.allocUnsafe(1 + 4 + msg.length + 4 + lang.length);
      let off = 0;
      payload[off++] = SSH_MSG_USERAUTH_BANNER;
      payload.writeUInt32BE(msg.length, off);
      off += 4;
      msg.copy(payload, off);
      off += msg.length;
      payload.writeUInt32BE(lang.length, off);
      off += 4;
      lang.copy(payload, off);

      const result = decodeSshUserauthBanner(payload);
      expect(result.message).toBe("Welcome!\n");
      expect(result.languageTag).toBe("en-US");
    });
  });

  // -- decodeSshUserauthPkOk -------------------------------------------------

  describe("decodeSshUserauthPkOk", () => {
    it("decodes algorithm name and public key blob", () => {
      const algo = Buffer.from("ssh-ed25519", "ascii");
      const blob = Buffer.from("pk-blob-data");
      const payload = Buffer.allocUnsafe(1 + 4 + algo.length + 4 + blob.length);
      let off = 0;
      payload[off++] = SSH_MSG_USERAUTH_PK_OK;
      payload.writeUInt32BE(algo.length, off);
      off += 4;
      algo.copy(payload, off);
      off += algo.length;
      payload.writeUInt32BE(blob.length, off);
      off += 4;
      blob.copy(payload, off);

      const result = decodeSshUserauthPkOk(payload);
      expect(result.algorithmName).toBe("ssh-ed25519");
      expect(result.publicKeyBlob).toEqual(blob);
    });
  });

  // -- keyboard-interactive --------------------------------------------------

  describe("decodeSshUserauthInfoRequest / encodeSshUserauthInfoResponse", () => {
    it("round-trips keyboard-interactive prompt exchange", () => {
      // Build an INFO_REQUEST with two prompts.
      const name = "SSH authentication";
      const instruction = "Enter your OTP";
      const lang = "";
      const prompts = [
        { prompt: "OTP: ", echo: false },
        { prompt: "PIN: ", echo: false },
      ];

      // Encode the info request manually to test the decoder.
      function encodeStr(s: string): Buffer {
        const b = Buffer.from(s, "utf8");
        const out = Buffer.allocUnsafe(4 + b.length);
        out.writeUInt32BE(b.length, 0);
        b.copy(out, 4);
        return out;
      }

      const chunks: Buffer[] = [
        Buffer.from([SSH_MSG_USERAUTH_INFO_REQUEST]),
        encodeStr(name),
        encodeStr(instruction),
        encodeStr(lang),
        (() => {
          const b = Buffer.allocUnsafe(4);
          b.writeUInt32BE(prompts.length, 0);
          return b;
        })(),
        ...prompts.flatMap((p) => [encodeStr(p.prompt), Buffer.from([p.echo ? 1 : 0])]),
      ];
      const payload = Buffer.concat(chunks);

      const decoded = decodeSshUserauthInfoRequest(payload);
      expect(decoded.name).toBe(name);
      expect(decoded.instruction).toBe(instruction);
      expect(decoded.prompts).toHaveLength(2);
      expect(decoded.prompts[0]?.prompt).toBe("OTP: ");
      expect(decoded.prompts[0]?.echo).toBe(false);

      // Encode an INFO_RESPONSE.
      const responsePayload = encodeSshUserauthInfoResponse(["123456", "9999"]);
      expect(responsePayload[0]).toBe(SSH_MSG_USERAUTH_INFO_RESPONSE);
      const reader = new SshDataReader(responsePayload.subarray(1));
      expect(reader.readUint32()).toBe(2);
      expect(reader.readString().toString("utf8")).toBe("123456");
      expect(reader.readString().toString("utf8")).toBe("9999");
    });
  });
});
