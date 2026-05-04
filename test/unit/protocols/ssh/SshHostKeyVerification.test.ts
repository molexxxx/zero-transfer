import { Buffer } from "node:buffer";
import {
  createHash,
  createSign,
  generateKeyPairSync,
  randomBytes,
  sign as cryptoSign,
  type KeyObject,
} from "node:crypto";
import { describe, expect, it } from "vitest";
import { ProtocolError } from "../../../../src/errors/ZeroTransferError";
import { SshDataWriter } from "../../../../src/protocols/ssh/binary";
import { verifySshHostKeySignature } from "../../../../src/protocols/ssh/transport/SshHostKeyVerification";

/**
 * Encodes a positive big-endian byte buffer as an SSH `mpint` body (no length
 * prefix; the caller wraps with `writeString`).
 */
function toSshMpintBody(value: Buffer): Buffer {
  let body = value;
  while (body.length > 1 && body[0] === 0x00) body = body.subarray(1);
  if (body.length > 0 && (body[0]! & 0x80) !== 0) {
    body = Buffer.concat([Buffer.from([0x00]), body]);
  }
  return body;
}

function buildEd25519HostKeyBlob(publicKey: KeyObject): Buffer {
  // SPKI export = DER prefix (12 bytes) || raw 32 byte public key.
  const spki = publicKey.export({ format: "der", type: "spki" });
  const raw = spki.subarray(spki.length - 32);
  return new SshDataWriter().writeString("ssh-ed25519", "ascii").writeString(raw).toBuffer();
}

function buildEd25519SignatureBlob(privateKey: KeyObject, data: Buffer): Buffer {
  const signature = cryptoSign(null, data, privateKey);
  return new SshDataWriter().writeString("ssh-ed25519", "ascii").writeString(signature).toBuffer();
}

function buildRsaHostKeyBlob(publicKey: KeyObject, algorithmName: string): Buffer {
  const jwk = publicKey.export({ format: "jwk" });
  const e = Buffer.from(jwk.e!, "base64url");
  const n = Buffer.from(jwk.n!, "base64url");
  return new SshDataWriter()
    .writeString(algorithmName, "ascii")
    .writeString(toSshMpintBody(e))
    .writeString(toSshMpintBody(n))
    .toBuffer();
}

function buildRsaSignatureBlob(
  privateKey: KeyObject,
  data: Buffer,
  algorithmName: "rsa-sha2-256" | "rsa-sha2-512",
): Buffer {
  const hashAlgorithm = algorithmName === "rsa-sha2-256" ? "sha256" : "sha512";
  const signer = createSign(hashAlgorithm);
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKey);
  return new SshDataWriter().writeString(algorithmName, "ascii").writeString(signature).toBuffer();
}

function buildEcdsaHostKeyBlob(publicKey: KeyObject, curve: string): Buffer {
  const jwk = publicKey.export({ format: "jwk" });
  const x = Buffer.from(jwk.x!, "base64url");
  const y = Buffer.from(jwk.y!, "base64url");
  const point = Buffer.concat([Buffer.from([0x04]), x, y]);
  return new SshDataWriter()
    .writeString(`ecdsa-sha2-${curve}`, "ascii")
    .writeString(curve, "ascii")
    .writeString(point)
    .toBuffer();
}

function derEcdsaSignatureToSshBlob(derSignature: Buffer): Buffer {
  // Parse DER: SEQUENCE { INTEGER r, INTEGER s }
  let i = 0;
  if (derSignature[i++] !== 0x30) throw new Error("expected SEQUENCE");
  // length
  let len = derSignature[i++]!;
  if ((len & 0x80) !== 0) {
    const n = len & 0x7f;
    len = 0;
    for (let k = 0; k < n; k++) len = (len << 8) | derSignature[i++]!;
  }
  if (derSignature[i++] !== 0x02) throw new Error("expected INTEGER r");
  const rLen = derSignature[i++]!;
  const r = derSignature.subarray(i, i + rLen);
  i += rLen;
  if (derSignature[i++] !== 0x02) throw new Error("expected INTEGER s");
  const sLen = derSignature[i++]!;
  const s = derSignature.subarray(i, i + sLen);
  return new SshDataWriter()
    .writeString(toSshMpintBody(r))
    .writeString(toSshMpintBody(s))
    .toBuffer();
}

function buildEcdsaSignatureBlob(
  privateKey: KeyObject,
  data: Buffer,
  curve: "nistp256" | "nistp384" | "nistp521",
): Buffer {
  const hashAlgorithm =
    curve === "nistp256" ? "sha256" : curve === "nistp384" ? "sha384" : "sha512";
  const signer = createSign(hashAlgorithm);
  signer.update(data);
  signer.end();
  const derSignature = signer.sign({ dsaEncoding: "der", key: privateKey });
  const innerBlob = derEcdsaSignatureToSshBlob(derSignature);
  return new SshDataWriter()
    .writeString(`ecdsa-sha2-${curve}`, "ascii")
    .writeString(innerBlob)
    .toBuffer();
}

describe("verifySshHostKeySignature", () => {
  const exchangeHash = randomBytes(32);

  it("verifies a valid Ed25519 signature", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const result = verifySshHostKeySignature({
      exchangeHash,
      hostKeyBlob: buildEd25519HostKeyBlob(publicKey),
      signatureBlob: buildEd25519SignatureBlob(privateKey, Buffer.from(exchangeHash)),
    });
    expect(result.algorithmName).toBe("ssh-ed25519");
    expect(result.hostKeySha256).toHaveLength(32);
  });

  it("rejects a tampered Ed25519 signature", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const blob = buildEd25519SignatureBlob(privateKey, Buffer.from(exchangeHash));
    blob[blob.length - 1] = (blob[blob.length - 1]! ^ 0x01) & 0xff;
    expect(() =>
      verifySshHostKeySignature({
        exchangeHash,
        hostKeyBlob: buildEd25519HostKeyBlob(publicKey),
        signatureBlob: blob,
      }),
    ).toThrow(ProtocolError);
  });

  it("verifies a valid RSA-SHA2-256 signature", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const result = verifySshHostKeySignature({
      exchangeHash,
      hostKeyBlob: buildRsaHostKeyBlob(publicKey, "rsa-sha2-256"),
      signatureBlob: buildRsaSignatureBlob(privateKey, Buffer.from(exchangeHash), "rsa-sha2-256"),
    });
    expect(result.algorithmName).toBe("rsa-sha2-256");
  });

  it("verifies a valid RSA-SHA2-512 signature", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const result = verifySshHostKeySignature({
      exchangeHash,
      hostKeyBlob: buildRsaHostKeyBlob(publicKey, "rsa-sha2-512"),
      signatureBlob: buildRsaSignatureBlob(privateKey, Buffer.from(exchangeHash), "rsa-sha2-512"),
    });
    expect(result.algorithmName).toBe("rsa-sha2-512");
  });

  it("rejects legacy ssh-rsa (SHA-1) signatures", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    // Build a legacy ssh-rsa signature (SHA-1) and attempt to use it.
    const signer = createSign("sha1");
    signer.update(Buffer.from(exchangeHash));
    signer.end();
    const sig = signer.sign(privateKey);
    const sigBlob = new SshDataWriter().writeString("ssh-rsa", "ascii").writeString(sig).toBuffer();

    expect(() =>
      verifySshHostKeySignature({
        exchangeHash,
        hostKeyBlob: buildRsaHostKeyBlob(publicKey, "ssh-rsa"),
        signatureBlob: sigBlob,
      }),
    ).toThrow(ProtocolError);
  });

  for (const curve of ["nistp256", "nistp384", "nistp521"] as const) {
    const namedCurve = curve === "nistp256" ? "P-256" : curve === "nistp384" ? "P-384" : "P-521";

    it(`verifies a valid ECDSA ${curve} signature`, () => {
      const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve });
      const result = verifySshHostKeySignature({
        exchangeHash,
        hostKeyBlob: buildEcdsaHostKeyBlob(publicKey, curve),
        signatureBlob: buildEcdsaSignatureBlob(privateKey, Buffer.from(exchangeHash), curve),
      });
      expect(result.algorithmName).toBe(`ecdsa-sha2-${curve}`);
      const expectedSha = createHash("sha256")
        .update(buildEcdsaHostKeyBlob(publicKey, curve))
        .digest();
      expect(Buffer.compare(result.hostKeySha256, expectedSha)).toBe(0);
    });

    it(`rejects a tampered ECDSA ${curve} signature`, () => {
      const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve });
      const blob = buildEcdsaSignatureBlob(privateKey, Buffer.from(exchangeHash), curve);
      blob[blob.length - 1] = (blob[blob.length - 1]! ^ 0x01) & 0xff;
      expect(() =>
        verifySshHostKeySignature({
          exchangeHash,
          hostKeyBlob: buildEcdsaHostKeyBlob(publicKey, curve),
          signatureBlob: blob,
        }),
      ).toThrow(ProtocolError);
    });
  }

  it("rejects an ECDSA signature where the curve identifier is mismatched", () => {
    const { publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    // Manually build a malformed blob whose embedded curve identifier does not
    // match the algorithm prefix.
    const jwk = publicKey.export({ format: "jwk" });
    const x = Buffer.from(jwk.x!, "base64url");
    const y = Buffer.from(jwk.y!, "base64url");
    const point = Buffer.concat([Buffer.from([0x04]), x, y]);
    const malformedHostKey = new SshDataWriter()
      .writeString("ecdsa-sha2-nistp256", "ascii")
      .writeString("nistp384", "ascii") // wrong identifier
      .writeString(point)
      .toBuffer();
    expect(() =>
      verifySshHostKeySignature({
        exchangeHash,
        hostKeyBlob: malformedHostKey,
        signatureBlob: new SshDataWriter()
          .writeString("ecdsa-sha2-nistp256", "ascii")
          .writeString(Buffer.alloc(0))
          .toBuffer(),
      }),
    ).toThrow(ProtocolError);
  });
});
