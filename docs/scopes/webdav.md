# WebDAV

> WebDAV provider with PROPFIND listings and ranged downloads.

## Install

```bash
npm install @zero-transfer/webdav
```

## Overview

WebDAV provider — PROPFIND-based `list`/`stat`, ranged GET, PUT uploads, Basic auth, and ETag preservation. Speaks remote filesystem semantics over HTTP.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                              | Kind      | Notes              |
| ----------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createWebDavProviderFactory`](../api-md/functions/createWebDavProviderFactory.md) | Function  | See API reference. |
| [`WebDavProviderOptions`](../api-md/interfaces/WebDavProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                    | What it shows                      |
| ---------------------------------------------------------- | ---------------------------------- |
| [`examples/webdav-sync.ts`](../../examples/webdav-sync.ts) | WebDAV bidirectional sync example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/webdav`](../../packages/webdav)
