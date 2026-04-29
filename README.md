<p align="center">
  <img src="https://tonywied17.github.io/zero-transfer/assets/zero-transfer-logo.svg" alt="ZeroTransfer file transfer SDK for Node.js" width="720">
</p>

<h1 align="center">ZeroTransfer</h1>

<p align="center">
  <strong>One TypeScript SDK for moving files across every storage system you actually use.</strong><br/>
  FTP · FTPS · SFTP · HTTP(S) · WebDAV · S3-compatible · Azure Blob · GCS · Google Drive · Dropbox · OneDrive · Local
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zero-transfer/sdk"><img src="https://img.shields.io/npm/v/@zero-transfer/sdk.svg?style=for-the-badge&labelColor=0d1117&color=00b4d8&logo=npm&logoColor=white&label=%40zero-transfer%2Fsdk" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@zero-transfer/sdk"><img src="https://img.shields.io/npm/dm/@zero-transfer/sdk.svg?style=for-the-badge&labelColor=0d1117&color=00b4d8&logo=npm&logoColor=white" alt="npm downloads"></a>
  <a href="https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/tonywied17/zero-transfer/ci.yml?branch=main&style=for-the-badge&labelColor=0d1117&logo=githubactions&logoColor=white&label=CI" alt="CI"></a>
  <a href="https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ftonywied17.github.io%2Fzero-transfer%2Fbadges%2Ftests.json&style=for-the-badge&labelColor=0d1117&logo=vitest&logoColor=white" alt="Tests"></a>
  <a href="https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ftonywied17.github.io%2Fzero-transfer%2Fbadges%2Fcoverage.json&style=for-the-badge&labelColor=0d1117&logo=vitest&logoColor=white" alt="Coverage"></a>
  <a href="https://tonywied17.github.io/zero-transfer/"><img src="https://img.shields.io/badge/docs-typedoc-00b4d8?style=for-the-badge&labelColor=0d1117&logo=readthedocs&logoColor=white" alt="Docs"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-00b4d8?style=for-the-badge&labelColor=0d1117" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&labelColor=0d1117&logo=nodedotjs&logoColor=white" alt="Node.js"></a>
</p>

ZeroTransfer is a unified, TypeScript-first file transfer SDK for Node.js. One typed API speaks to every backend you actually deploy against — classic protocols, web endpoints, object storage, cloud drives, and local disks — with streaming, resume, verification, dry-run plans, MFT-style scheduling, audit logs, and webhook delivery built in.

```ts
import {
  createS3ProviderFactory,
  createTransferClient,
  uploadFile,
} from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createS3ProviderFactory({ region: "us-east-1" })],
});

// One call, any provider you registered above.
await uploadFile({
  client,
  localPath: "./dist/app.tar.gz",
  destination: {
    path: "/lake/bronze/app.tar.gz",
    profile: {
      provider: "s3",
      host: "data-lake-bronze",
      username: { env: "AWS_ACCESS_KEY_ID" },
      password: { env: "AWS_SECRET_ACCESS_KEY" },
    },
  },
});
```

---

## Why ZeroTransfer

- **One API, every provider.** Replace bespoke FTP, SFTP, S3, and cloud-drive code with a single `TransferClient` and provider-neutral sessions.
- **TypeScript-first.** Strict types, exact optional properties, exhaustive capability discovery, and typed errors for every protocol failure mode.
- **Streaming + resume.** Backpressure via `stream.pipeline`, byte-range downloads, multipart uploads, and cross-process resume stores for object storage.
- **Dry-run-first sync.** Diff remote trees, generate `TransferPlan`s, and review every step before any byte moves.
- **MFT batteries.** Routes, cron + interval schedules, audit logs, HMAC-signed webhooks, retention policies, and approval gates that block on human sign-off.
- **Security by default.** Profile redaction in every log, host-key pinning, certificate fingerprint pinning, OAuth refresh, and SecretSource adapters for vaults / env / files / commands.
- **Observable.** Structured logger, redaction-safe diagnostics, immutable transfer receipts, and per-attempt history for compliance.

## Install

```bash
# Batteries-included SDK (every provider):
npm install @zero-transfer/sdk

# Or pick a scoped slice (today these re-export the full SDK; future releases will narrow):
npm install @zero-transfer/sftp
npm install @zero-transfer/s3
npm install @zero-transfer/mft
```

Requires Node.js **>=20**.

## Scoped packages

ZeroTransfer publishes 13 scoped packages under the [`@zero-transfer`](https://www.npmjs.com/org/zero-transfer) npm organization. [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) is the batteries-included distribution; the other 12 are **narrowly scoped** packages that re-export only the symbols listed in their [scope page](docs/scopes/README.md). Pick one to keep your dependency tree tight, or install the SDK if you want every provider in one go.

| Package                                                                                    | Summary                                                                       | Docs                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------- |
| [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk)                   | Batteries-included distribution. Every provider, every helper.                | [API reference](docs/api-md/README.md)    |
| [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core)                 | Provider-neutral contracts, transfer engine, queue, profiles, errors.         | [Scope page](docs/scopes/core.md)         |
| [`@zero-transfer/classic`](https://www.npmjs.com/package/@zero-transfer/classic)           | FTP + FTPS + SFTP in one install.                                             | [Scope page](docs/scopes/classic.md)      |
| [`@zero-transfer/ftp`](https://www.npmjs.com/package/@zero-transfer/ftp)                   | Classic FTP with EPSV/PASV streaming and REST resume.                         | [Scope page](docs/scopes/ftp.md)          |
| [`@zero-transfer/ftps`](https://www.npmjs.com/package/@zero-transfer/ftps)                 | Explicit + implicit FTPS with full TLS profile support.                       | [Scope page](docs/scopes/ftps.md)         |
| [`@zero-transfer/sftp`](https://www.npmjs.com/package/@zero-transfer/sftp)                 | SFTP with SSH key auth, known_hosts, and jump-host support.                   | [Scope page](docs/scopes/sftp.md)         |
| [`@zero-transfer/http`](https://www.npmjs.com/package/@zero-transfer/http)                 | HTTP(S) and signed-URL provider with ranged downloads.                        | [Scope page](docs/scopes/http.md)         |
| [`@zero-transfer/webdav`](https://www.npmjs.com/package/@zero-transfer/webdav)             | WebDAV with PROPFIND listings and ranged downloads.                           | [Scope page](docs/scopes/webdav.md)       |
| [`@zero-transfer/s3`](https://www.npmjs.com/package/@zero-transfer/s3)                     | S3-compatible storage with SigV4, multipart upload, and cross-process resume. | [Scope page](docs/scopes/s3.md)           |
| [`@zero-transfer/google-drive`](https://www.npmjs.com/package/@zero-transfer/google-drive) | Google Drive with OAuth, folder paths, md5 checksums.                         | [Scope page](docs/scopes/google-drive.md) |
| [`@zero-transfer/dropbox`](https://www.npmjs.com/package/@zero-transfer/dropbox)           | Dropbox with content-hash verification.                                       | [Scope page](docs/scopes/dropbox.md)      |
| [`@zero-transfer/azure-blob`](https://www.npmjs.com/package/@zero-transfer/azure-blob)     | Azure Blob Storage with SAS or AAD bearer auth.                               | [Scope page](docs/scopes/azure-blob.md)   |
| [`@zero-transfer/mft`](https://www.npmjs.com/package/@zero-transfer/mft)                   | Routes, schedules, audit logs, webhooks, approval gates.                      | [Scope page](docs/scopes/mft.md)          |

The full per-scope index lives at [`docs/scopes/`](docs/scopes/README.md).

## Quick start

### 1. Connect a provider-neutral client

```ts
import { createSftpProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createSftpProviderFactory()],
});

const session = await client.connect({
  provider: "sftp",
  host: "files.example.com",
  username: { env: "ZT_USER" },
  password: { env: "ZT_PASSWORD" },
  ssh: {
    knownHosts: { path: "./known_hosts" },
    pinnedHostKeySha256: "SHA256:base64-encoded-host-key-digest",
  },
});

const releases = await session.fs.list("/releases");
await session.disconnect();
```

### 2. Move a file with one call

```ts
import { uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  localPath: "./dist/app.tar.gz",
  destination: { path: "/releases/2026.04.28/app.tar.gz", profile: sftpProfile },
  onProgress: (event) => console.log(`${event.bytesTransferred}/${event.totalBytes ?? "?"}`),
});
```

### 3. Plan a sync without touching bytes

```ts
import { createSyncPlan, diffRemoteTrees, summarizeTransferPlan } from "@zero-transfer/sdk";

const diff = await diffRemoteTrees(srcSession.fs, "/dist", dstSession.fs, "/releases/current");
const plan = createSyncPlan({
  id: "release-sync",
  diff,
  source: { provider: "sftp", rootPath: "/dist" },
  destination: { provider: "s3", rootPath: "/releases/current" },
  deletePolicy: "mirror",
});
console.table(summarizeTransferPlan(plan));
```

### 4. Schedule it as an MFT route with audit + approval

```ts
import {
  ApprovalRegistry,
  MftScheduler,
  RouteRegistry,
  ScheduleRegistry,
  createApprovalGate,
  runRoute,
} from "@zero-transfer/sdk";

const approvals = new ApprovalRegistry();
const scheduler = new MftScheduler({
  client,
  routes: new RouteRegistry([route]),
  schedules: scheduleRegistry,
  runner: createApprovalGate({
    approvalId: ({ route }) => `release:${route.id}:${Date.now()}`,
    registry: approvals,
    runner: ({ client: c, route: r, signal }) => runRoute({ client: c, route: r, signal }),
  }),
  onResult: ({ receipt }) => console.log(`Released ${receipt.jobId}`),
});

scheduler.start();
```

## Capability matrix

Every provider advertises its own [`CapabilitySet`](docs/api-md/interfaces/CapabilitySet.md). The full programmatic matrix is exposed via [`getBuiltinCapabilityMatrix()`](docs/api-md/functions/getBuiltinCapabilityMatrix.md) and renders to Markdown via [`formatCapabilityMatrixMarkdown()`](docs/api-md/functions/formatCapabilityMatrixMarkdown.md).

| Provider      | Streaming |              Resume              | Server-side copy | Multipart upload |     Checksum exposed     |
| ------------- | :-------: | :------------------------------: | :--------------: | :--------------: | :----------------------: |
| FTP           |    ✅     |           ⬆/⬇ via REST           |        —         |        —         |            —             |
| FTPS          |    ✅     |           ⬆/⬇ via REST           |        —         |        —         |            —             |
| SFTP          |    ✅     |               ⬆/⬇                |      rename      |        —         |            —             |
| HTTP(S)       | ✅ (read) |           ⬇ via Range            |        —         |        —         |           ETag           |
| WebDAV        |    ✅     |           ⬇ via Range            |       COPY       |        —         |           ETag           |
| S3-compatible |    ✅     | ⬆ via multipart resume / ⬇ Range |    CopyObject    |        ✅        |      SHA-256 / md5       |
| Azure Blob    |    ✅     |           ⬇ via Range            |        —         |    (planned)     |           md5            |
| GCS           |    ✅     |           ⬇ via Range            |        —         |    (planned)     |       crc32c / md5       |
| Google Drive  |    ✅     |           ⬇ via Range            |        —         |        —         |           md5            |
| Dropbox       |    ✅     |           ⬇ via Range            |        —         |        —         |       content_hash       |
| OneDrive      |    ✅     |           ⬇ via Range            |        —         |    (planned)     | sha256 / sha1 / quickXor |
| Local         |    ✅     |               ⬆/⬇                |        —         |        —         |            —             |
| Memory        |    ✅     |               ⬆/⬇                |        —         |        —         |            —             |

## Examples

Real-world examples live in [`examples/`](https://github.com/tonywied17/zero-transfer/tree/main/examples). Run them with `tsx examples/<file>`.

| Example                                                                     | What it shows                                                     |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`local-copy-file.ts`](examples/local-copy-file.ts)                         | Zero-config local-to-local copy via `copyBetween`.                |
| [`ftp-basic.ts`](examples/ftp-basic.ts)                                     | Plain FTP upload + download round-trip with username/password.    |
| [`ftps-basic.ts`](examples/ftps-basic.ts)                                   | FTPS with username/password over a public-CA endpoint.            |
| [`ftps-client-certificate.ts`](examples/ftps-client-certificate.ts)         | FTPS hardened: mTLS + private CA bundle + fingerprint pinning.    |
| [`sftp-basic.ts`](examples/sftp-basic.ts)                                   | Minimal SFTP with username/password (no host-key pinning).        |
| [`sftp-private-key.ts`](examples/sftp-private-key.ts)                       | SFTP hardened: private-key auth + pinned host-key SHA-256.        |
| [`s3-compatible-upload.ts`](examples/s3-compatible-upload.ts)               | S3 multipart upload with cross-process resume store.              |
| [`webdav-sync.ts`](examples/webdav-sync.ts)                                 | WebDAV diff + sync plan with deterministic ordering.              |
| [`signed-url-download.ts`](examples/signed-url-download.ts)                 | HTTPS signed-URL download with progress reporting.                |
| [`transfer-queue.ts`](examples/transfer-queue.ts)                           | Concurrent transfers with `TransferQueue` + executor.             |
| [`dry-run-sync.ts`](examples/dry-run-sync.ts)                               | Plan a sync, print a summary, never touch bytes.                  |
| [`mft-route.ts`](examples/mft-route.ts)                                     | SFTP→S3 cron-scheduled MFT route with audit hooks.                |
| [`profile-from-env.ts`](examples/profile-from-env.ts)                       | Build a `ConnectionProfile` from env / file / base64-env secrets. |
| [`diagnose-connection.ts`](examples/diagnose-connection.ts)                 | Provider summary + redaction-safe connection probe.               |
| [`approval-gated-route.ts`](examples/approval-gated-route.ts)               | Two-person rule: scheduled route blocks until approval lands.     |
| [`multi-cloud-orchestration.ts`](examples/multi-cloud-orchestration.ts)     | Fan-out SFTP → S3 + Azure + Local with webhook audit.             |
| [`atomic-deploy-with-rollback.ts`](examples/atomic-deploy-with-rollback.ts) | Blue/green-style deploy plan with rollback path.                  |

## Documentation

- [Full API reference (HTML)](https://tonywied17.github.io/zero-transfer/) — TypeDoc HTML site, deployed from `main` on every push.
- [Full API reference (Markdown)](docs/api-md/README.md) — every public symbol with parameter / property / type tables.
- [Per-scope pages](docs/scopes/README.md) — one page per `@zero-transfer/*` package.
- [Examples directory](https://github.com/tonywied17/zero-transfer/tree/main/examples) — runnable real-world flows.

Regenerate everything locally:

```bash
npm run docs:all      # HTML + Markdown api refs + per-scope pages + per-package READMEs
```

## Project status

ZeroTransfer is in **alpha** under the `alpha` npm dist-tag. The provider-neutral foundation, transfer engine, queue, sync planner, atomic deploy planner, MFT layer, friendly client surface, and diagnostics module are stable. Phase work in progress: resumable upload sessions for Azure / GCS / OneDrive, broader real-server compatibility coverage, and the push to higher coverage targets.

## Contributing

```bash
git clone https://github.com/tonywied17/zero-transfer.git
cd zero-transfer
npm install
npm run ci          # lint, format check, typecheck, tests with coverage, build, pack dry-run
npm run test:watch  # iterate
```

Issues and PRs welcome. Provider integration tests are gated behind opt-in env vars — see [`test/integration/`](https://github.com/tonywied17/zero-transfer/tree/main/test/integration) for the full list.

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
