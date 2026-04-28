# @zero-transfer/dropbox

> Dropbox provider with content-hash verification.

Dropbox provider — RPC + content-host APIs, list-folder cursor pagination, ranged downloads, single-shot uploads in `overwrite` mode, and `content_hash` exposed as both `uniqueId` and `checksum`.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/dropbox
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/dropbox";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/dropbox.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
