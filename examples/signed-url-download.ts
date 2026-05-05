/**
 * @file Signed-URL HTTP download example.
 *
 * Demonstrates pulling a one-time signed URL down to disk via the friendly
 * `downloadFile` helper. The HTTPS provider uses HEAD for metadata, supports
 * Range-resume, and exposes the upstream ETag as the receipt checksum.
 */
import {
  createHttpProviderFactory,
  createLocalProviderFactory,
  createTransferClient,
  downloadFile,
  type ConnectionProfile,
} from "@zero-transfer/http";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createHttpProviderFactory(), createLocalProviderFactory()],
  });

  const signedHost = process.env["SIGNED_HOST"] ?? "downloads.example.com";

  const sourceProfile: ConnectionProfile = {
    host: signedHost,
    provider: "https",
  };

  const receipt = await downloadFile({
    client,
    localPath: "./downloads/release.tar.gz",
    onProgress: (event) => {
      const total = event.totalBytes ?? 0;
      const pct = total > 0 ? Math.round((event.bytesTransferred / total) * 100) : 0;
      process.stdout.write(`\rDownloading: ${pct}%`);
    },
    source: {
      path: "/releases/release.tar.gz?X-Amz-Signature=demo&X-Amz-Expires=900",
      profile: sourceProfile,
    },
  });

  process.stdout.write("\n");
  console.log(`Downloaded ${receipt.bytesTransferred} bytes (etag=${receipt.checksum ?? "n/a"}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
