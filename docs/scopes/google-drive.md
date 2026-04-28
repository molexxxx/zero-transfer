# Google Drive

> Google Drive provider with OAuth, folder paths, and md5 checksums.

## Install

```bash
npm install @zero-transfer/google-drive
```

## Overview

Google Drive provider over OAuth bearer tokens — paginated folder listings from a configurable root folder id, ranged downloads via `alt=media`, single-shot multipart uploads, and `md5Checksum` exposed as both `uniqueId` and `checksum`.

## Public surface

This is the actual surface published by [`@zero-transfer/google-drive`](https://www.npmjs.com/package/@zero-transfer/google-drive). Every symbol is re-exported from [`@zero-transfer/sdk`](../api-md/README.md) and links into the full API reference:

| Symbol                                                                                        | Kind      | Notes              |
| --------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createGoogleDriveProviderFactory`](../api-md/functions/createGoogleDriveProviderFactory.md) | Function  | See API reference. |
| [`GoogleDriveProviderOptions`](../api-md/interfaces/GoogleDriveProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                                                | What it shows                       |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| [`examples/multi-cloud-orchestration.ts`](../../examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/google-drive`](../../packages/google-drive)
