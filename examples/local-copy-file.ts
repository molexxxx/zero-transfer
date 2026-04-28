/**
 * @file Local-to-local file copy example.
 *
 * Uses the `local` provider to copy a file between two paths on the local
 * filesystem with `copyBetween`. Requires no credentials and runs offline,
 * so it's the fastest way to exercise the SDK end-to-end on a fresh checkout.
 */
import { fileURLToPath } from "node:url";

import {
  copyBetween,
  createLocalProviderFactory,
  createTransferClient,
  type ConnectionProfile,
} from "@zero-transfer/core";

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createLocalProviderFactory()],
  });

  const local: ConnectionProfile = { host: "local", provider: "local" };

  const receipt = await copyBetween({
    client,
    destination: { path: "./tmp/report.copy.csv", profile: local },
    source: { path: "./out/report.csv", profile: local },
  });

  console.log(`Copied ${receipt.bytesTransferred} bytes locally (job=${receipt.jobId}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
