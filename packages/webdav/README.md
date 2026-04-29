# @zero-transfer/webdav

> WebDAV provider with PROPFIND listings and ranged downloads.

## Install

```bash
npm install @zero-transfer/webdav
```

## Overview

WebDAV provider — PROPFIND-based `list`/`stat`, ranged GET, PUT uploads, Basic auth, and ETag preservation. Speaks remote filesystem semantics over HTTP.

## Usage

```ts
import { createWebDavProviderFactory } from "@zero-transfer/webdav";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **2** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol                                                                                                                                      | Kind      | Notes              |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createWebDavProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createWebDavProviderFactory.md) | Function  | See API reference. |
| [`WebDavProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/WebDavProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                                                                    | What it shows                      |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [`examples/webdav-sync.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/webdav-sync.ts) | WebDAV bidirectional sync example. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/webdav.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
