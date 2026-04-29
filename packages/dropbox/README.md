# @zero-transfer/dropbox

> Dropbox provider with content-hash verification.

## Install

```bash
npm install @zero-transfer/dropbox
```

## Overview

Dropbox provider — RPC + content-host APIs, list-folder cursor pagination, ranged downloads, single-shot uploads in `overwrite` mode, and `content_hash` exposed as both `uniqueId` and `checksum`.

## Usage

```ts
import { createDropboxProviderFactory } from "@zero-transfer/dropbox";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **2** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol                                                                                                                                        | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createDropboxProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createDropboxProviderFactory.md) | Function  | See API reference. |
| [`DropboxProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/DropboxProviderOptions.md)            | Interface | See API reference. |

## Examples

_No dedicated example yet — see the [examples directory](https://github.com/tonywied17/zero-transfer/tree/main/examples) for cross-scope showcases._

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/dropbox.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
