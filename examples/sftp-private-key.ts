/**
 * @file SFTP private-key authentication example with host-key pinning.
 *
 * This is the **production-hardened** form: public-key auth + a SHA-256 host-key
 * pin. For the minimal connect-only form, see `sftp-basic.ts`.
 *
 * `ssh.privateKey` is required for key-based auth. `ssh.pinnedHostKeySha256` is
 * **optional but strongly recommended** — without it (or `ssh.knownHosts`) the
 * SSH session does not verify the server's host key.
 */
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "../src/index";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createSftpProviderFactory()],
  });

  const profile: ConnectionProfile = {
    host: "sftp.example.com",
    port: 22,
    provider: "sftp",
    ssh: {
      // Optional but strongly recommended: copy the SHA256 line from your
      // known_hosts file or `ssh-keyscan -t ed25519 host | ssh-keygen -lf -`.
      pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
      privateKey: { path: "./keys/id_ed25519" },
    },
    username: "deploy",
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
