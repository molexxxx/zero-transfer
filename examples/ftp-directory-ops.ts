/**
 * @file FTP directory operations: list, stat, mkdir, rename, remove, rmdir.
 *
 * `uploadFile` / `downloadFile` cover the common case, but every connected
 * session also exposes a provider-neutral `RemoteFileSystem` at `session.fs`
 * with the full classic FTP command surface mapped onto typed methods:
 *
 *   - `list(path)`     LIST / MLSD with Unix LIST fallback
 *   - `stat(path)`     MLST (size, mtime, type)
 *   - `mkdir(path)`    MKD
 *   - `rename(a, b)`   RNFR / RNTO
 *   - `remove(path)`   DELE
 *   - `rmdir(path)`    RMD
 *
 * Use this when you need to inspect a remote tree, prepare a target directory
 * before an upload, or clean up after a transfer. The same `session.fs` API
 * is identical on FTPS and SFTP - see `ftps-directory-ops.ts` and
 * `sftp-directory-ops.ts` for the parallel flows.
 */
import {
  createFtpProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/ftp";

const client = createTransferClient({
  providers: [createFtpProviderFactory()],
});

const profile: ConnectionProfile = {
  host: "ftp.example.com",
  password: { env: "FTP_PASSWORD" },
  port: 21,
  provider: "ftp",
  username: "deploy",
};

const session = await client.connect(profile);
try {
  // 1. Make sure the destination directory exists.
  await session.fs.mkdir?.("/incoming/2026-05");

  // 2. Drop a file into it via the high-level helper (uses the same session pool).
  await uploadFile({
    client,
    destination: { path: "/incoming/2026-05/report.csv", profile },
    localPath: "./out/report.csv",
  });

  // 3. List the directory and print stat info for each entry.
  const entries = await session.fs.list("/incoming/2026-05");
  for (const entry of entries) {
    const info = await session.fs.stat(`/incoming/2026-05/${entry.name}`);
    console.log(`${entry.type.padEnd(9)} ${String(info.size ?? "-").padStart(10)}  ${entry.name}`);
  }

  // 4. Rename, then remove. Both methods are optional on the adapter;
  //    classic FTP supports both, so the optional-chaining is just future-proofing.
  await session.fs.rename?.(
    "/incoming/2026-05/report.csv",
    "/incoming/2026-05/report.archived.csv",
  );
  await session.fs.remove?.("/incoming/2026-05/report.archived.csv");

  // 5. Remove the now-empty directory.
  await session.fs.rmdir?.("/incoming/2026-05");
} finally {
  await session.disconnect();
}
