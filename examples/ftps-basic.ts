/**
 * @file Minimal FTPS example with username/password over a public-CA TLS endpoint.
 *
 * For an endpoint whose certificate is signed by a public certificate authority
 * (e.g. Let's Encrypt, DigiCert), no extra TLS material is required: Node's
 * built-in trust store validates the chain via `rejectUnauthorized: true`.
 *
 * Both `tls.ca` (private CA bundle) and `tls.pinnedFingerprint256` (certificate
 * pinning) are **optional** in {@link TlsProfile}. Use them when:
 *   - the server uses a private/internal CA \u2192 supply `tls.ca`.
 *   - you want defence-in-depth against rogue trusted-CA certs \u2192 supply
 *     `tls.pinnedFingerprint256`. See `ftps-client-certificate.ts`.
 */
import { fileURLToPath } from "node:url";
import {
  createFtpsProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "../src/index";

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createFtpsProviderFactory()],
  });

  const profile: ConnectionProfile = {
    host: "ftps.example.com",
    password: { env: "FTPS_PASSWORD" },
    port: 21,
    provider: "ftps",
    tls: {
      minVersion: "TLSv1.2",
      // rejectUnauthorized defaults to true \u2014 public CA chain is enforced.
    },
    username: "deploy",
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
