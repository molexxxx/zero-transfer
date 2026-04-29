# WebDAV

> WebDAV provider with PROPFIND listings and ranged downloads.

## Install

```bash
npm install @zero-transfer/webdav
```

## Overview

WebDAV provider — PROPFIND-based `list`/`stat`, ranged GET, PUT uploads, Basic auth, and ETag preservation. Speaks remote filesystem semantics over HTTP.

## Public surface

This is the actual surface published by [`@zero-transfer/webdav`](https://www.npmjs.com/package/@zero-transfer/webdav). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createWebDavProviderFactory`](../api-md/functions/createWebDavProviderFactory.md) | Function | See API reference. |
| [`WebDavProviderOptions`](../api-md/interfaces/WebDavProviderOptions.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/webdav-sync.ts`](../../examples/webdav-sync.ts) | WebDAV bidirectional sync example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/webdav`](../../packages/webdav)
