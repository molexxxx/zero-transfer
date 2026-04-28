# `packages/*` — Scoped @zero-transfer packages

This directory holds the npm workspace folders for every package in the
[`@zero-transfer/*`](https://www.npmjs.com/org/zero-transfer) family.

Each package is **narrowly scoped**: its `dist/index.{mjs,cjs,d.ts}` re-exports
**only** the named symbols listed for that scope in
[`scripts/scope-manifest.mjs`](../scripts/scope-manifest.mjs). The full SDK is
declared as a runtime dependency, so the surface is real (not a re-export of
everything) and tree-shakable consumers only pay for what they import.

| Package                       | Public surface                                                 |
| ----------------------------- | -------------------------------------------------------------- |
| `@zero-transfer/sdk`          | Batteries-included — every provider and helper                 |
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
npm run packages:generate   # rewrites packages/*/dist + package.json
npm run docs:scopes         # refreshes per-scope MD pages and READMEs
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
