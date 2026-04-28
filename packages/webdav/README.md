# @zero-transfer/webdav

> WebDAV provider with PROPFIND listings and ranged downloads.

WebDAV provider — PROPFIND-based `list`/`stat`, ranged GET, PUT uploads, Basic auth, and ETag preservation. Speaks remote filesystem semantics over HTTP.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/webdav
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/webdav";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/webdav.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
