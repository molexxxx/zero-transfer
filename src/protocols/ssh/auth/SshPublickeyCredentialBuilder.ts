/**
 * Builds an {@link SshPublickeyCredential} from a Node `KeyObject` private key.
 *
 * Supported algorithms:
 *   - Ed25519 → signature algorithm `ssh-ed25519`
 *   - RSA → signature algorithm `rsa-sha2-512` (preferred) or `rsa-sha2-256`
 *
 * Node 17+ accepts OpenSSH-format private keys (the `-----BEGIN OPENSSH PRIVATE KEY-----`
 * envelope) directly via `crypto.createPrivateKey`, so the caller can pass either
 * OpenSSH or PKCS#8 PEM material.
 *
 * Encrypted keys are supported by passing a `passphrase` to `createPrivateKey`
 * before calling this helper; this module does not perform decryption.
 */
import { Buffer } from "node:buffer";
import { createPublicKey, sign as cryptoSign, type KeyObject } from "node:crypto";
import { ConfigurationError } from "../../../errors/ZeroTransferError";
import { SshDataWriter } from "../binary/SshDataWriter";
import type { SshPublickeyCredential } from "./SshAuthSession";

const ED25519_RAW_KEY_LENGTH = 32;
// DER SubjectPublicKeyInfo prefix for Ed25519 public keys (RFC 8410).
const ED25519_SPKI_PREFIX_LENGTH = 12;

export interface BuildPublickeyCredentialOptions {
  /** Username to authenticate as. */
  username: string;
  /** Decoded private key (OpenSSH or PKCS8 PEM accepted by `crypto.createPrivateKey`). */
  privateKey: KeyObject;
  /**
   * For RSA keys, the SSH signature algorithm. Defaults to `rsa-sha2-512`.
   * Ignored for Ed25519 keys.
   */
  rsaSignatureAlgorithm?: "rsa-sha2-256" | "rsa-sha2-512";
}

export function buildPublickeyCredential(
  options: BuildPublickeyCredentialOptions,
): SshPublickeyCredential {
  const { privateKey, username } = options;
  const publicKey = createPublicKey(privateKey);

  switch (privateKey.asymmetricKeyType) {
    case "ed25519": {
      const spki = publicKey.export({ format: "der", type: "spki" });
      if (spki.length !== ED25519_SPKI_PREFIX_LENGTH + ED25519_RAW_KEY_LENGTH) {
        throw createInvalidKeyError("Ed25519 SPKI export has unexpected length");
      }
      const raw = spki.subarray(ED25519_SPKI_PREFIX_LENGTH);
      const publicKeyBlob = new SshDataWriter()
        .writeString("ssh-ed25519", "ascii")
        .writeString(raw)
        .toBuffer();
      return {
        algorithmName: "ssh-ed25519",
        publicKeyBlob,
        sign: (data: Uint8Array): Buffer => cryptoSign(null, Buffer.from(data), privateKey),
        type: "publickey",
        username,
      };
    }

    case "rsa": {
      const algorithmName = options.rsaSignatureAlgorithm ?? "rsa-sha2-512";
      const hash = algorithmName === "rsa-sha2-256" ? "sha256" : "sha512";
      const jwk = publicKey.export({ format: "jwk" });
      if (jwk.n === undefined || jwk.e === undefined) {
        throw createInvalidKeyError("RSA public key is missing modulus or exponent");
      }
      // SSH wire format uses two's-complement mpints. base64url JWK fields are
      // unsigned big-endian, so prepend a 0x00 if the high bit is set.
      const n = base64UrlToMpint(jwk.n);
      const e = base64UrlToMpint(jwk.e);
      const publicKeyBlob = new SshDataWriter()
        .writeString("ssh-rsa", "ascii")
        .writeMpint(e)
        .writeMpint(n)
        .toBuffer();
      return {
        algorithmName,
        publicKeyBlob,
        sign: (data: Uint8Array): Buffer => cryptoSign(hash, Buffer.from(data), privateKey),
        type: "publickey",
        username,
      };
    }

    default:
      throw createInvalidKeyError(
        `Unsupported SSH private key type: ${privateKey.asymmetricKeyType ?? "unknown"}`,
      );
  }
}

function base64UrlToMpint(value: string): Buffer {
  // base64url → base64
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const buffer = Buffer.from(padded, "base64");
  // writeMpint will add the required leading 0x00 if the high bit is set.
  return buffer;
}

function createInvalidKeyError(message: string): ConfigurationError {
  return new ConfigurationError({
    message,
    protocol: "sftp",
    retryable: false,
  });
}
