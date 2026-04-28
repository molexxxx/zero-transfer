# `packages/*` — Scoped Workspace Stubs

This directory holds the npm workspace stubs for the future
[`@zero-transfer/*` monorepo shape](../zero-transfer-remake.md#future-monorepo-shape).

Each stub is currently an **umbrella package** that re-exports the entire
[`@zero-transfer/sdk`](../package.json) public surface. The intent is twofold:

1. **Claim the scoped names** on npm so nobody else can squat them.
2. **Forward path** — future releases narrow each stub to its own provider
   surface without breaking consumers.

| Package                       | Eventual surface                                               |
| ----------------------------- | -------------------------------------------------------------- |
| `@zero-transfer/core`         | `TransferClient`, providers, profiles, errors, transfer engine |
| `@zero-transfer/classic`      | FTP + FTPS + SFTP                                              |
| `@zero-transfer/ftp`          | `createFtpProviderFactory`                                     |
| `@zero-transfer/ftps`         | `createFtpsProviderFactory`                                    |
| `@zero-transfer/sftp`         | `createSftpProviderFactory` + jump-host helper                 |
| `@zero-transfer/http`         | `createHttpProviderFactory`                                    |
| `@zero-transfer/webdav`       | `createWebDavProviderFactory`                                  |
| `@zero-transfer/s3`           | `createS3ProviderFactory` + multipart resume                   |
| `@zero-transfer/google-drive` | `createGoogleDriveProviderFactory`                             |
| `@zero-transfer/dropbox`      | `createDropboxProviderFactory`                                 |
| `@zero-transfer/azure-blob`   | `createAzureBlobProviderFactory`                               |
| `@zero-transfer/mft`          | Routes, schedules, audit logs, webhooks, approvals             |

`@zero-transfer/sdk` remains the batteries-included distribution.

## Regenerate

```bash
npm run packages:generate
```

This rewrites every stub's `package.json`, `dist/`, and `README.md` from
`scripts/generate-package-stubs.mjs`. Hand-edit the generator, not the stubs.

## Publish

The SDK must be published first so the stubs' `dependencies["@zero-transfer/sdk"]`
resolves. Then:

```bash
npm run packages:publish -- --dry-run   # validate
npm run packages:publish                # release
npm run packages:publish -- --tag next  # pre-release dist-tag
```
