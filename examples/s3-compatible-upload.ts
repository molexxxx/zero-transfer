/**
 * @file S3-compatible multipart upload example.
 *
 * Shows how to wire `createS3ProviderFactory` with multipart enabled and a
 * persistent resume store, then upload a large file via the friendly helper.
 * Works against AWS S3, MinIO, R2, Wasabi, and other SigV4-compatible APIs.
 */
import {
  createMemoryS3MultipartResumeStore,
  createS3ProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/s3";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  const resumeStore = createMemoryS3MultipartResumeStore();
  const client = createTransferClient({
    providers: [
      createS3ProviderFactory({
        endpoint: "https://s3.us-east-1.amazonaws.com",
        multipart: {
          enabled: true,
          partSizeBytes: 8 * 1024 * 1024,
          resumeStore,
          thresholdBytes: 8 * 1024 * 1024,
        },
        region: "us-east-1",
      }),
    ],
  });

  const profile: ConnectionProfile = {
    host: "my-bucket",
    password: { env: "AWS_SECRET_ACCESS_KEY" },
    provider: "s3",
    username: { env: "AWS_ACCESS_KEY_ID" },
  };

  const receipt = await uploadFile({
    client,
    destination: { path: "/backups/db-snapshot.tar.gz", profile },
    localPath: "./backups/db-snapshot.tar.gz",
    onProgress: (event) => {
      console.log(`Progress: ${event.bytesTransferred} bytes transferred.`);
    },
  });

  console.log(`Upload complete (job=${receipt.jobId}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
