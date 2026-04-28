# @zero-transfer/google-drive

> Google Drive provider with OAuth, folder paths, and md5 checksums.

Google Drive provider over OAuth bearer tokens — paginated folder listings from a configurable root folder id, ranged downloads via `alt=media`, single-shot multipart uploads, and `md5Checksum` exposed as both `uniqueId` and `checksum`.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/google-drive
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/google-drive";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/google-drive.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
