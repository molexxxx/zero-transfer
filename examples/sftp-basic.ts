/**
 * @file Minimal SFTP example with password authentication.
 *
 * This is the smallest viable SFTP profile: host, username, password, port.
 * Host-key verification is **not** configured here; the connection accepts any
 * key the server presents.
 *
 * For production, prefer either:
 *   - `sftp-private-key.ts` (key + host pin), or
 *   - a profile that supplies `ssh.knownHosts` or `ssh.pinnedHostKeySha256`.
 *
 * Both fields are optional in {@link SshProfile} but strongly recommended outside of
 * trusted, lab-only networks.
 */
import { fileURLToPath } from "node:url";
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "../src/index";

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createSftpProviderFactory()],
  });

  const profile: ConnectionProfile = {
    host: "sftp.example.com",
    password: { env: "SFTP_PASSWORD" },
    port: 22,
    provider: "sftp",
    username: "deploy",
    // Optional but recommended for production:
    //   ssh: { pinnedHostKeySha256: "SHA256:abc123..." }
    //   ssh: { knownHosts: { path: "./known_hosts" } }
  };

  const receipt = await uploadFile({
    client,
    destination: { path: "/uploads/report.csv", profile },
    localPath: "./out/report.csv",
  });

  console.log(`Uploaded ${receipt.bytesTransferred} bytes (job=${receipt.jobId}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
