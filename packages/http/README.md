# @zero-transfer/http

> HTTP(S) and signed-URL provider with ranged downloads.

Read-only HTTP(S) provider with HEAD-based metadata, ranged GET resume, Basic auth, Bearer-token auth via secret sources, and ETag exposed as both `uniqueId` and read-result `checksum`. Useful for signed-URL downloads and CDN ingest.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/http
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/http";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/http.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
