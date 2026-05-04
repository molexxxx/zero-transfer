/**
 * SSH server host key signature verification (RFC 4253 §6.6, §8).
 *
 * The KEX_ECDH_REPLY message carries:
 *   - K_S: the server's public host key blob (algorithm-prefixed, SSH wire format)
 *   - signature: H signed with the host private key
 *
 * The client MUST verify the signature against H using the algorithm advertised
 * by the K_S blob. Without this check, the server's identity is unauthenticated
 * and the entire transport is vulnerable to a man-in-the-middle attack.
 */
import { Buffer } from "node:buffer";
import { createHash, createPublicKey, verify as cryptoVerify, type KeyObject } from "node:crypto";
import { ProtocolError } from "../../../errors/ZeroTransferError";
import { SshDataReader } from "../binary/SshDataReader";

const ED25519_RAW_KEY_LENGTH = 32;
// DER SubjectPublicKeyInfo prefix for Ed25519 public keys (RFC 8410).
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

/**
 * Verifies the server's host key signature over the SSH exchange hash.
 *
 * @throws ProtocolError if the signature is invalid, the algorithm is unsupported,
 *   or the host key blob is malformed.
 */
export function verifySshHostKeySignature(input: {
  exchangeHash: Uint8Array;
  hostKeyBlob: Uint8Array;
  signatureBlob: Uint8Array;
}): { algorithmName: string; hostKeySha256: Buffer } {
  const { algorithmName, publicKey } = parseHostKey(input.hostKeyBlob);
  const { signatureAlgorithm, signatureBytes } = parseSignatureBlob(input.signatureBlob);

  if (!isCompatibleSignatureAlgorithm(algorithmName, signatureAlgorithm)) {
    throw new ProtocolError({
      details: { hostKeyAlgorithm: algorithmName, signatureAlgorithm },
      message: "SSH host key signature algorithm does not match host key type",
      protocol: "sftp",
      retryable: false,
    });
  }

  const verified = verifySignature({
    data: Buffer.from(input.exchangeHash),
    publicKey,
    signature: Buffer.from(signatureBytes),
    signatureAlgorithm,
  });

  if (!verified) {
    throw new ProtocolError({
      details: { signatureAlgorithm },
      message: "SSH host key signature verification failed",
      protocol: "sftp",
      retryable: false,
    });
  }

  const hostKeySha256 = createHash("sha256").update(input.hostKeyBlob).digest();
  return { algorithmName, hostKeySha256 };
}

interface ParsedHostKey {
  algorithmName: string;
  publicKey: KeyObject;
}

function parseHostKey(blob: Uint8Array): ParsedHostKey {
  const reader = new SshDataReader(blob);
  const algorithmName = reader.readString().toString("ascii");

  switch (algorithmName) {
    case "ssh-ed25519": {
      const raw = reader.readString();
      reader.assertFinished();
      if (raw.length !== ED25519_RAW_KEY_LENGTH) {
        throw new ProtocolError({
          details: { actualLength: raw.length, expectedLength: ED25519_RAW_KEY_LENGTH },
          message: "Ed25519 host key has invalid length",
          protocol: "sftp",
          retryable: false,
        });
      }
      const spki = Buffer.concat([ED25519_SPKI_PREFIX, raw]);
      return {
        algorithmName,
        publicKey: createPublicKey({ format: "der", key: spki, type: "spki" }),
      };
    }

    case "rsa-sha2-256":
    case "rsa-sha2-512":
    case "ssh-rsa": {
      // RSA public keys: mpint e, mpint n.
      const e = reader.readMpint();
      const n = reader.readMpint();
      reader.assertFinished();
      return {
        algorithmName,
        publicKey: rsaPublicKeyFromComponents(e, n),
      };
    }

    case "ecdsa-sha2-nistp256":
    case "ecdsa-sha2-nistp384":
    case "ecdsa-sha2-nistp521": {
      // RFC 5656 §3.1: string "ecdsa-sha2-[identifier]" || string identifier || string Q
      // where Q is the uncompressed point bytes.
      const curveIdentifier = reader.readString().toString("ascii");
      const expectedIdentifier = algorithmName.slice("ecdsa-sha2-".length);
      if (curveIdentifier !== expectedIdentifier) {
        throw new ProtocolError({
          details: { algorithmName, curveIdentifier },
          message: "ECDSA host key curve identifier does not match algorithm",
          protocol: "sftp",
          retryable: false,
        });
      }
      const point = reader.readString();
      reader.assertFinished();
      return {
        algorithmName,
        publicKey: ecdsaPublicKeyFromPoint(curveIdentifier, point),
      };
    }

    default:
      throw new ProtocolError({
        details: { algorithmName },
        message: "Unsupported SSH host key algorithm",
        protocol: "sftp",
        retryable: false,
      });
  }
}

interface ParsedSignatureBlob {
  signatureAlgorithm: string;
  signatureBytes: Buffer;
}

function parseSignatureBlob(blob: Uint8Array): ParsedSignatureBlob {
  const reader = new SshDataReader(blob);
  const signatureAlgorithm = reader.readString().toString("ascii");
  const signatureBytes = reader.readString();
  // Some servers append nothing more; do not assertFinished to remain forgiving
  // of trailing bytes from extension formats.
  return { signatureAlgorithm, signatureBytes };
}

function isCompatibleSignatureAlgorithm(
  hostKeyAlgorithm: string,
  signatureAlgorithm: string,
): boolean {
  if (hostKeyAlgorithm === signatureAlgorithm) return true;
  // RFC 8332: an "ssh-rsa" host key can sign with either rsa-sha2-256 or rsa-sha2-512.
  if (hostKeyAlgorithm === "ssh-rsa") {
    return signatureAlgorithm === "rsa-sha2-256" || signatureAlgorithm === "rsa-sha2-512";
  }
  return false;
}

function verifySignature(input: {
  data: Buffer;
  publicKey: KeyObject;
  signature: Buffer;
  signatureAlgorithm: string;
}): boolean {
  switch (input.signatureAlgorithm) {
    case "ssh-ed25519":
      // Ed25519 signs over the raw data; Node's verify() with `null` algorithm.
      return cryptoVerify(null, input.data, input.publicKey, input.signature);

    case "rsa-sha2-256":
      return cryptoVerify("sha256", input.data, input.publicKey, input.signature);

    case "rsa-sha2-512":
      return cryptoVerify("sha512", input.data, input.publicKey, input.signature);

    case "ecdsa-sha2-nistp256":
      return cryptoVerify(
        "sha256",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature),
      );

    case "ecdsa-sha2-nistp384":
      return cryptoVerify(
        "sha384",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature),
      );

    case "ecdsa-sha2-nistp521":
      return cryptoVerify(
        "sha512",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature),
      );

    case "ssh-rsa":
      // Legacy SHA-1 RSA. Disabled by default for security; reject explicitly.
      throw new ProtocolError({
        message: "Legacy ssh-rsa (SHA-1) host key signatures are not accepted",
        protocol: "sftp",
        retryable: false,
      });

    default:
      throw new ProtocolError({
        details: { signatureAlgorithm: input.signatureAlgorithm },
        message: "Unsupported SSH host key signature algorithm",
        protocol: "sftp",
        retryable: false,
      });
  }
}

/**
 * Builds a Node KeyObject from RSA components (e, n) encoded as SSH mpints.
 * Uses ASN.1 DER SubjectPublicKeyInfo so that crypto.verify accepts the result.
 */
function rsaPublicKeyFromComponents(e: Buffer, n: Buffer): KeyObject {
  const eDer = encodeAsn1Integer(e);
  const nDer = encodeAsn1Integer(n);
  const rsaPublicKeyDer = encodeAsn1Sequence(Buffer.concat([nDer, eDer]));
  // BIT STRING wrap: 0x03 LEN 0x00 (unused-bits) || rsaPublicKeyDer
  const bitStringContent = Buffer.concat([Buffer.from([0x00]), rsaPublicKeyDer]);
  const bitString = Buffer.concat([
    Buffer.from([0x03]),
    encodeAsn1Length(bitStringContent.length),
    bitStringContent,
  ]);
  // AlgorithmIdentifier for rsaEncryption: SEQUENCE { OID 1.2.840.113549.1.1.1, NULL }.
  const algoId = Buffer.from("300d06092a864886f70d010101 0500".replace(/\s+/g, ""), "hex");
  const spki = encodeAsn1Sequence(Buffer.concat([algoId, bitString]));
  return createPublicKey({ format: "der", key: spki, type: "spki" });
}

function encodeAsn1Integer(value: Buffer): Buffer {
  // Strip leading zero bytes but preserve a single zero if value is exactly 0.
  let body = value;
  while (body.length > 1 && body[0] === 0x00) body = body.subarray(1);
  // Prepend a 0x00 if the high bit is set so the integer remains positive.
  if (body.length > 0 && (body[0]! & 0x80) !== 0) {
    body = Buffer.concat([Buffer.from([0x00]), body]);
  }
  return Buffer.concat([Buffer.from([0x02]), encodeAsn1Length(body.length), body]);
}

function encodeAsn1Sequence(content: Buffer): Buffer {
  return Buffer.concat([Buffer.from([0x30]), encodeAsn1Length(content.length), content]);
}

function encodeAsn1Length(length: number): Buffer {
  if (length < 0x80) return Buffer.from([length]);
  const bytes: number[] = [];
  let n = length;
  while (n > 0) {
    bytes.unshift(n & 0xff);
    n >>>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

// -- ECDSA helpers -------------------------------------------------------------

// Named-curve OIDs (RFC 5480).
const ECDSA_OID_BY_CURVE = {
  nistp256: "06082a8648ce3d030107", // secp256r1 / prime256v1
  nistp384: "06052b81040022", // secp384r1
  nistp521: "06052b81040023", // secp521r1
} as const;

// id-ecPublicKey: 1.2.840.10045.2.1
const ECDSA_ALGORITHM_OID_HEX = "06072a8648ce3d0201";

/**
 * Builds a Node KeyObject from an SSH-encoded ECDSA point. The point is the
 * uncompressed SEC1 encoding (0x04 || X || Y) for nistp256/384/521.
 */
function ecdsaPublicKeyFromPoint(curveIdentifier: string, point: Buffer): KeyObject {
  const oidHex = ECDSA_OID_BY_CURVE[curveIdentifier as keyof typeof ECDSA_OID_BY_CURVE];
  if (oidHex === undefined) {
    throw new ProtocolError({
      details: { curveIdentifier },
      message: "Unsupported ECDSA curve",
      protocol: "sftp",
      retryable: false,
    });
  }
  // AlgorithmIdentifier: SEQUENCE { id-ecPublicKey, namedCurve OID }
  const algoIdContent = Buffer.from(ECDSA_ALGORITHM_OID_HEX + oidHex, "hex");
  const algoId = encodeAsn1Sequence(algoIdContent);
  // BIT STRING wrap of the point bytes: 0x03 LEN 0x00 (unused-bits) || point
  const bitStringContent = Buffer.concat([Buffer.from([0x00]), point]);
  const bitString = Buffer.concat([
    Buffer.from([0x03]),
    encodeAsn1Length(bitStringContent.length),
    bitStringContent,
  ]);
  const spki = encodeAsn1Sequence(Buffer.concat([algoId, bitString]));
  return createPublicKey({ format: "der", key: spki, type: "spki" });
}

/**
 * Converts an SSH-format ECDSA signature blob (RFC 5656 §3.1.2:
 * `mpint r || mpint s`) into the ASN.1 DER `Ecdsa-Sig-Value` SEQUENCE that
 * `crypto.verify` expects.
 */
function sshEcdsaSignatureToDer(sshSignature: Buffer): Buffer {
  const reader = new SshDataReader(sshSignature);
  const r = reader.readMpint();
  const s = reader.readMpint();
  // Trailing bytes are tolerated for the same forgiveness reasons as the outer
  // signature blob parser.
  const rDer = encodeAsn1Integer(r);
  const sDer = encodeAsn1Integer(s);
  return encodeAsn1Sequence(Buffer.concat([rDer, sDer]));
}
