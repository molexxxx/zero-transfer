/**
 * @file SFTP private-key authentication example.
 *
 * Demonstrates how to construct a `ConnectionProfile` for the SFTP provider
 * using a private key file, optional passphrase, and a SHA-256 host key pin,
 * then upload a single local file with the friendly `uploadFile` helper.
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
