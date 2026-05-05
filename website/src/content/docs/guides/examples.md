---
title: Examples
description: End-to-end runnable examples covering every major use case.
---

The repository ships with runnable end-to-end examples in [`examples/`](https://github.com/tonywied17/zero-transfer/tree/main/examples). Each one is self-contained, typed, and safe to copy/paste as a starting point.

## Connecting

| File                                                                                                                      | What it shows                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`sftp-basic.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-basic.ts)                           | Password-auth SFTP, list + download.                           |
| [`sftp-private-key.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-private-key.ts)               | Public-key SFTP with `known_hosts` and host-key pinning.       |
| [`ssh-exec-command.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ssh-exec-command.ts)               | Standalone SSH transport: handshake, auth, exec, drain stdout. |
| [`ftp-basic.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftp-basic.ts)                             | Plain FTP with passive mode.                                   |
| [`ftps-basic.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-basic.ts)                           | Explicit FTPS with a CA bundle.                                |
| [`ftps-client-certificate.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-client-certificate.ts) | FTPS with mTLS + fingerprint pinning.                          |
| [`profile-from-env.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/profile-from-env.ts)               | Build a `ConnectionProfile` entirely from env vars.            |
| [`diagnose-connection.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/diagnose-connection.ts)         | Run connection diagnostics with redacted output.               |

## Cloud providers

| File                                                                                                                          | What it shows                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`s3-compatible-upload.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/s3-compatible-upload.ts)           | Multipart upload to S3 (and any S3-compatible bucket). |
| [`signed-url-download.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/signed-url-download.ts)             | Resolve an HTTP signed URL and stream it to disk.      |
| [`webdav-sync.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/webdav-sync.ts)                             | One-way sync to a WebDAV server, with delete-policy.   |
| [`multi-cloud-orchestration.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/multi-cloud-orchestration.ts) | Pull from S3, push to Azure Blob + GCS in parallel.    |

## Transfers, sync, MFT

| File                                                                                                                              | What it shows                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`local-copy-file.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/local-copy-file.ts)                         | Copy a file using the local filesystem provider.            |
| [`transfer-queue.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/transfer-queue.ts)                           | Bounded-concurrency queue with progress + retry.            |
| [`dry-run-sync.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/dry-run-sync.ts)                               | Plan a sync, summarise it, decide whether to execute.       |
| [`atomic-deploy-with-rollback.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/atomic-deploy-with-rollback.ts) | Stage → swap → rollback pattern for zero-downtime releases. |
| [`mft-route.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/mft-route.ts)                                     | Define a route + schedule + scheduler.                      |
| [`approval-gated-route.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/approval-gated-route.ts)               | Wrap a route in a human-approval gate before bytes move.    |

## Running an example

```bash
# from repo root
npm install
npm run build

# run with tsx (already a devDep)
npx tsx examples/sftp-private-key.ts
```

Most examples read connection details from environment variables - see the top of each file for the expected names. Use [`examples/profile-from-env.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/profile-from-env.ts) as a template for your own integrations.
