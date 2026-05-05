/**
 * @file Minimal SFTP example with password authentication \u2014 the WinSCP-equivalent setup.
 *
 * Just like connecting from a GUI client (WinSCP, FileZilla), all you need for
 * a typical SFTP endpoint is host, username, password, and port 22. No SSH
 * keys, fingerprints, or `known_hosts` files are required to get started.
 *
 * Host-key verification is **not** configured here; the connection accepts any
 * key the server presents. That matches the WinSCP "first-connect" flow but
 * leaves you exposed to MITM. For production, prefer either:
 *   - `sftp-private-key.ts` (key + host pin), or
 *   - add `ssh.knownHosts` or `ssh.pinnedHostKeySha256` to this profile.
 */
import { fileURLToPath } from "node:url";
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/sftp";

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
