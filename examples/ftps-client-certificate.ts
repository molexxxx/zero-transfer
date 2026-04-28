/**
 * @file FTPS client-certificate (mutual TLS) example.
 *
 * Demonstrates explicit FTPS with client certificate authentication, a CA bundle,
 * and a SHA-256 server certificate pin. Uploads a payload to an audit endpoint
 * via the friendly `uploadFile` helper.
 */
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
      ca: { path: "./certs/ca-bundle.pem" },
      cert: { path: "./certs/client.crt" },
      key: { path: "./certs/client.key" },
      minVersion: "TLSv1.2",
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

void main();
