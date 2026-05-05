/**
 * @file Diagnose a connection without exposing secrets.
 *
 * Uses `summarizeClientDiagnostics` to enumerate registered providers and
 * `runConnectionDiagnostics` to open a session against a profile, sample
 * a directory listing, and surface redacted timings/capabilities. Suitable
 * for support flows or CI smoke checks.
 */
import {
  createFtpProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
  runConnectionDiagnostics,
  summarizeClientDiagnostics,
  type ConnectionProfile,
} from "@zero-transfer/sdk";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createSftpProviderFactory(), createFtpProviderFactory()],
  });

  console.log("Registered providers:");
  for (const entry of summarizeClientDiagnostics(client).providers) {
    const auth = entry.capabilities.authentication.join("/") || "none";
    console.log(`  - ${entry.id} (auth=${auth}, writeStream=${entry.capabilities.writeStream})`);
  }

  const profile: ConnectionProfile = {
    host: process.env["DIAG_HOST"] ?? "sftp.example.com",
    password: { env: "DIAG_PASSWORD" },
    provider: "sftp",
    username: process.env["DIAG_USER"] ?? "diag",
  };

  const result = await runConnectionDiagnostics({
    client,
    listPath: process.env["DIAG_PATH"] ?? "/",
    profile,
    sampleSize: 3,
  });

  if (result.ok) {
    console.log(`OK: connect=${result.timings.connectMs}ms list=${result.timings.listMs}ms`);
    console.log(`Sample: ${result.sample?.map((entry) => entry.path).join(", ")}`);
  } else {
    console.error(`FAILED: ${result.error?.code ?? ""} ${result.error?.message ?? ""}`);
  }
  console.log("Redacted profile:", result.redactedProfile);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
