# @zero-transfer/http

> HTTP(S) and signed-URL provider with ranged downloads.

## Install

```bash
npm install @zero-transfer/http
```

## Overview

Read-only HTTP(S) provider with HEAD-based metadata, ranged GET resume, Basic auth, Bearer-token auth via secret sources, and ETag exposed as both `uniqueId` and read-result `checksum`. Useful for signed-URL downloads and CDN ingest.

## Usage

```ts
import { createHttpProviderFactory } from "@zero-transfer/http";
```

## Public surface

This package publishes a narrowed surface of **3** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                  | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createHttpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createHttpProviderFactory.md) | Function  | See API reference. |
| [`HttpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/HttpProviderOptions.md)            | Interface | See API reference. |
| [`HttpFetch`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/HttpFetch.md)                              | Type      | See API reference. |

## Examples

| Example                                                                                                                    | What it shows                     |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [`examples/signed-url-download.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/signed-url-download.ts) | Signed-URL HTTP download example. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/http.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
