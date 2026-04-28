# @zero-transfer/google-drive

> Google Drive provider with OAuth, folder paths, and md5 checksums.

Google Drive provider over OAuth bearer tokens — paginated folder listings from a configurable root folder id, ranged downloads via `alt=media`, single-shot multipart uploads, and `md5Checksum` exposed as both `uniqueId` and `checksum`.

## Install

```bash
npm install @zero-transfer/google-drive
```

## Usage

```ts
import { createGoogleDriveProviderFactory } from "@zero-transfer/google-drive";
```

## Public surface

This package narrows the SDK to **2** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/google-drive.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/google-drive.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
