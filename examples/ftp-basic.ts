/**
 * @file Basic FTP upload + download example.
 *
 * The simplest possible end-to-end FTP flow: connect with username/password,
 * upload a single local file with `uploadFile`, then download it back to a
 * different local path with `downloadFile`. Useful as a starting point before
 * layering in TLS (`ftps-client-certificate`), SSH (`sftp-private-key`), or
 * scheduled MFT routes (`mft-route`).
 */
import { fileURLToPath } from "node:url";

import {
  createFtpProviderFactory,
  createTransferClient,
  downloadFile,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/ftp";

async function main(): Promise<void> {
  const client = createTransferClient({
    providers: [createFtpProviderFactory()],
  });

  const profile: ConnectionProfile = {
    host: "ftp.example.com",
    port: 21,
    provider: "ftp",
    username: "deploy",
    password: { value: process.env.FTP_PASSWORD ?? "" },
  };

  const upload = await uploadFile({
    client,
    destination: { path: "/incoming/report.csv", profile },
    localPath: "./out/report.csv",
  });
  console.log(`Uploaded ${upload.bytesTransferred} bytes (job=${upload.jobId}).`);

  const download = await downloadFile({
    client,
    localPath: "./out/report.roundtrip.csv",
    source: { path: "/incoming/report.csv", profile },
  });
  console.log(`Downloaded ${download.bytesTransferred} bytes (job=${download.jobId}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
