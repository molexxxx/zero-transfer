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
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/sftp";

const client = createTransferClient({
  // Single-file transfers are pipelined by default: a sliding window of 64
  // in-flight requests x 32 KiB (OpenSSH parity) hides per-request round
  // trips on high-latency links. Tune or serialize via the pipeline option:
  //   createSftpProviderFactory({ pipeline: { maxInFlight: 64, chunkBytes: 32_768 } })
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
