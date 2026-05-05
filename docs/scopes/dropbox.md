# Dropbox

> Dropbox provider with content-hash verification.

## Install

```bash
npm install @zero-transfer/dropbox
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/dropbox"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Dropbox provider — RPC + content-host APIs, list-folder cursor pagination, ranged downloads, single-shot uploads in `overwrite` mode, and `content_hash` exposed as both `uniqueId` and `checksum`.

## Public surface

This is the actual surface published by [`@zero-transfer/dropbox`](https://www.npmjs.com/package/@zero-transfer/dropbox). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createDropboxProviderFactory`](../api-md/functions/createDropboxProviderFactory.md) | Function | See API reference. |
| [`DropboxProviderOptions`](../api-md/interfaces/DropboxProviderOptions.md) | Interface | See API reference. |

## Examples

_No dedicated example yet — see the [examples directory](../../examples/) for cross-scope showcases._

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/dropbox`](../../packages/dropbox)
