# `packages/*` - Scoped @zero-transfer packages

This directory holds the npm workspace folders for every package in the
[`@zero-transfer/*`](https://www.npmjs.com/org/zero-transfer) family.

Each package is **self-contained**: its `dist/index.{mjs,cjs,d.ts}` bundles the
complete `@zero-transfer/core` surface plus only the protocol code and dependencies
for that scope. Consumers install **one package** and get everything they need -
no separate `@zero-transfer/sdk` install required.

Only `@zero-transfer/sftp` and `@zero-transfer/classic` declare a runtime npm
dependency (`ssh2`). All other scopes have zero npm dependencies (they use
`node:net`, `node:tls`, `node:crypto`, and the native `fetch` API).

| Package                       | Public surface                                                 |
| ----------------------------- | -------------------------------------------------------------- |
| `@zero-transfer/sdk`          | Batteries-included - every provider and helper                 |
| `@zero-transfer/core`         | `TransferClient`, providers, profiles, errors, transfer engine |
| `@zero-transfer/classic`      | FTP + FTPS + SFTP                                              |
| `@zero-transfer/ftp`          | `createFtpProviderFactory` + parsers                           |
| `@zero-transfer/ftps`         | `createFtpsProviderFactory`                                    |
| `@zero-transfer/sftp`         | `createSftpProviderFactory` + jump-host helper                 |
| `@zero-transfer/http`         | `createHttpProviderFactory`                                    |
| `@zero-transfer/webdav`       | `createWebDavProviderFactory`                                  |
| `@zero-transfer/s3`           | `createS3ProviderFactory` + multipart resume                   |
| `@zero-transfer/google-drive` | `createGoogleDriveProviderFactory`                             |
| `@zero-transfer/dropbox`      | `createDropboxProviderFactory`                                 |
| `@zero-transfer/azure-blob`   | `createAzureBlobProviderFactory`                               |
| `@zero-transfer/mft`          | Routes, schedules, audit logs, webhooks, approvals             |

See each package's [scope page](../docs/scopes/README.md) for the full list of
exports with links into the API reference.

## Regenerate

```bash
npm run build               # compile all scoped bundles via tsup
npm run packages:generate   # rewrites packages/*/package.json at current version
npm run docs:scopes         # refreshes per-scope MD pages and READMEs
```

This rewrites every stub's `package.json` from `scripts/generate-package-stubs.mjs`
and rebuilds `dist/` via `src/entries/<scope>.ts` entry points. Hand-edit the
generator or tsup config, not the stubs.

## Publish

The SDK must be published first so the root workspace resolves. Then:

```bash
npm run packages:publish -- --dry-run   # validate
npm run packages:publish                # release
npm run packages:publish -- --tag next  # pre-release dist-tag
```
