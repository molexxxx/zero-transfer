/**
 * @file FTPS client-certificate (mutual TLS) example with certificate pinning.
 *
 * This is the **production-hardened** form: mTLS with a private CA bundle and a
 * SHA-256 server-cert pin. For the minimal connect-only form against a
 * public-CA endpoint, see `ftps-basic.ts`.
 *
 * `tls.cert` + `tls.key` are required only when the server demands client
 * certificates (mTLS). `tls.ca` is required only for private/internal CAs.
 * `tls.pinnedFingerprint256` is **optional but recommended** as defence in
 * depth against rogue certificates issued by an otherwise-trusted CA.
 */
import {
  createFtpsProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/ftps";

import { fileURLToPath } from "node:url";
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
      // Required only for private CAs; omit for public-CA endpoints.
      ca: { path: "./certs/ca-bundle.pem" },
      // Required only for mutual-TLS endpoints that demand a client cert.
      cert: { path: "./certs/client.crt" },
      key: { path: "./certs/client.key" },
      minVersion: "TLSv1.2",
      // Optional but recommended: defence-in-depth against rogue trusted-CA certs.
      pinnedFingerprint256:
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
    },
    username: "audit-bot",
  };

  await uploadFile({
    client,
    destination: { path: "/audit/payload.json", profile },
    localPath: "./out/payload.json",
  });
  console.log("FTPS upload completed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
