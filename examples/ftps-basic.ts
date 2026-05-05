/**
 * @file Minimal FTPS example with username/password \u2014 the WinSCP-equivalent setup.
 *
 * Just like connecting from a GUI client (WinSCP, FileZilla), all you need for
 * a typical FTPS endpoint is host, username, password, and port. The entire
 * `tls` block is **optional**: for any server with a publicly-trusted
 * certificate (Let's Encrypt, DigiCert, etc.) Node's built-in trust store
 * validates the chain automatically.
 *
 * Add a `tls` block only if you need one of:
 *   - `tls.ca` \u2014 server uses a private/internal CA.
 *   - `tls.cert` + `tls.key` \u2014 server requires a client certificate (mTLS).
 *   - `tls.pinnedFingerprint256` \u2014 defence-in-depth certificate pinning.
 *   - `tls.minVersion` \u2014 raise the floor above the Node default.
 * See `ftps-client-certificate.ts` for the production-hardened variant.
 */
import { fileURLToPath } from "node:url";
import {
  createFtpsProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/ftps";

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createFtpsProviderFactory()],
  });

  const profile: ConnectionProfile = {
    host: "ftps.example.com",
    password: { env: "FTPS_PASSWORD" },
    port: 21,
    provider: "ftps",
    username: "deploy",
    // Optional. Omit entirely for public-CA endpoints \u2014 TLS still applies.
    //   tls: { minVersion: "TLSv1.2" }
  };

  await uploadFile({
    client,
    destination: { path: "/uploads/report.csv", profile },
    localPath: "./out/report.csv",
  });
  console.log("FTPS upload completed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
