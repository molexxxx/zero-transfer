/**
 * @file S3-compatible parallel multipart upload example.
 *
 * Shows how to wire `createS3ProviderFactory` with parallel multipart upload
 * (parts upload concurrently; progress and checkpoints advance on the
 * contiguous completed prefix) plus the unified checkpoint store so
 * interrupted uploads resume across retries and process restarts. Works
 * against AWS S3, MinIO, R2, Wasabi, and other SigV4-compatible APIs.
 */
import {
  createFileSystemTransferCheckpointStore,
  createS3ProviderFactory,
  createTransferClient,
  uploadFile,
  type ConnectionProfile,
} from "@zero-transfer/s3";

const client = createTransferClient({
  defaults: {
    // Unified checkpoints: keyed by source+destination path, so a re-run of
    // this script resumes the multipart upload instead of restarting it.
    resume: {
      store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
    },
  },
  providers: [
    createS3ProviderFactory({
      endpoint: "https://s3.us-east-1.amazonaws.com",
      multipart: {
        enabled: true,
        // 4 parts in flight at once (the default). Memory stays bounded at
        // (partConcurrency + 1) x partSizeBytes; 1 reproduces sequential uploads.
        partConcurrency: 4,
        partSizeBytes: 8 * 1024 * 1024,
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

console.log(`Upload complete (job=${receipt.jobId}, resumed=${receipt.resumed}).`);
