/**
 * @file Build a connection profile from environment variables.
 *
 * Demonstrates env-backed `SecretSource` shapes (`{ env }` for strings and
 * `{ base64Env }` for binary keys) plus `validateConnectionProfile` and
 * `redactConnectionProfile` so logs never reveal secret material.
 */
import {
  redactConnectionProfile,
  resolveConnectionProfileSecrets,
  validateConnectionProfile,
  type ConnectionProfile,
} from "@zero-transfer/core";

function buildSftpProfile(): ConnectionProfile {
  return {
    host: process.env["SFTP_HOST"] ?? "sftp.example.com",
    port: Number.parseInt(process.env["SFTP_PORT"] ?? "22", 10),
    provider: "sftp",
    ssh: {
      passphrase: { env: "SFTP_KEY_PASSPHRASE" },
      ...(process.env["SFTP_HOST_KEY_SHA256"] !== undefined
        ? { pinnedHostKeySha256: process.env["SFTP_HOST_KEY_SHA256"] }
        : {}),
      privateKey: { base64Env: "SFTP_PRIVATE_KEY_BASE64" },
    },
    timeoutMs: 30_000,
    username: process.env["SFTP_USER"] ?? "deploy",
  };
}

const profile = validateConnectionProfile(buildSftpProfile());
console.log("Loaded profile:", redactConnectionProfile(profile));

const resolved = await resolveConnectionProfileSecrets(profile);
console.log(
  `Resolved secrets for host ${resolved.host}: privateKey ${resolved.ssh?.privateKey ? "present" : "missing"}`,
);
