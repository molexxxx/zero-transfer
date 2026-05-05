/**
 * @file SFTP directory operations: list, stat, mkdir, rename, remove, rmdir.
 *
 * Identical session API to FTP / FTPS - `session.fs` is provider-neutral.
 * Under the hood SFTP uses SSH file-attribute packets (SSH_FXP_OPENDIR,
 * READDIR, STAT, MKDIR, RENAME, REMOVE, RMDIR) instead of FTP commands, but
 * the typed surface is the same so application code stays portable.
 *
 * For host-key pinning + key-based auth, see `sftp-private-key.ts`. To run
 * one-shot remote commands without a transfer session, see
 * `ssh-exec-command.ts`.
 */
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/sftp";

const client = createTransferClient({
  providers: [createSftpProviderFactory()],
});

const profile: ConnectionProfile = {
  host: "sftp.example.com",
  password: { env: "SFTP_PASSWORD" },
  port: 22,
  provider: "sftp",
  username: "deploy",
  // Recommended for production: pin the host key.
  //   ssh: { pinnedHostKeySha256: "SHA256:abc123..." }
  //   ssh: { knownHosts: { path: "./known_hosts" } }
};

const session = await client.connect(profile);
try {
  await session.fs.mkdir?.("/incoming/2026-05");

  await uploadFile({
    client,
    destination: { path: "/incoming/2026-05/report.csv", profile },
    localPath: "./out/report.csv",
  });

  const entries = await session.fs.list("/incoming/2026-05");
  for (const entry of entries) {
    const info = await session.fs.stat(`/incoming/2026-05/${entry.name}`);
    console.log(`${entry.type.padEnd(9)} ${String(info.size ?? "-").padStart(10)}  ${entry.name}`);
  }

  await session.fs.rename?.(
    "/incoming/2026-05/report.csv",
    "/incoming/2026-05/report.archived.csv",
  );
  await session.fs.remove?.("/incoming/2026-05/report.archived.csv");
  await session.fs.rmdir?.("/incoming/2026-05");
} finally {
  await session.disconnect();
}
