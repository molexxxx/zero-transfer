# @zero-transfer/google-drive

> Google Drive provider with OAuth, folder paths, and md5 checksums.

## Install

```bash
npm install @zero-transfer/google-drive
```

## Overview

Google Drive provider over OAuth bearer tokens — paginated folder listings from a configurable root folder id, ranged downloads via `alt=media`, single-shot multipart uploads, and `md5Checksum` exposed as both `uniqueId` and `checksum`.

## Usage

```ts
import { createGoogleDriveProviderFactory } from "@zero-transfer/google-drive";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **2** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createGoogleDriveProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createGoogleDriveProviderFactory.md) | Function | See API reference. |
| [`GoogleDriveProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/GoogleDriveProviderOptions.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/multi-cloud-orchestration.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/google-drive.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
