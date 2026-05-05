/**
 * @file FTPS directory operations: list, stat, mkdir, rename, remove, rmdir.
 *
 * Identical session API to plain FTP - the only difference is the provider
 * factory and the optional `tls` block. `session.fs` exposes the full classic
 * directory surface backed by MLST/MLSD/LIST and RNFR/RNTO/DELE/MKD/RMD over
 * the encrypted control + data channels.
 *
 * See `ftp-directory-ops.ts` for the cleartext variant and
 * `sftp-directory-ops.ts` for the SSH-backed equivalent.
 */
import {
  createFtpsProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/ftps";

const client = createTransferClient({
  providers: [createFtpsProviderFactory()],
});

const profile: ConnectionProfile = {
  host: "ftps.example.com",
  password: { env: "FTPS_PASSWORD" },
  port: 21,
  provider: "ftps",
  username: "deploy",
  // Public-CA endpoints need no `tls` block. Add one only for private CAs,
  // mTLS, or fingerprint pinning - see `ftps-client-certificate.ts`.
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
