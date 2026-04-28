# HTTP(S)

> HTTP(S) and signed-URL provider with ranged downloads.

## Install

```bash
npm install @zero-transfer/http
```

## Overview

Read-only HTTP(S) provider with HEAD-based metadata, ranged GET resume, Basic auth, Bearer-token auth via secret sources, and ETag exposed as both `uniqueId` and read-result `checksum`. Useful for signed-URL downloads and CDN ingest.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                          | Kind      | Notes              |
| ------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createHttpProviderFactory`](../api-md/functions/createHttpProviderFactory.md) | Function  | See API reference. |
| [`HttpProviderOptions`](../api-md/interfaces/HttpProviderOptions.md)            | Interface | See API reference. |
| [`HttpFetch`](../api-md/type-aliases/HttpFetch.md)                              | Type      | See API reference. |

## Examples

| Example                                                                    | What it shows                     |
| -------------------------------------------------------------------------- | --------------------------------- |
| [`examples/signed-url-download.ts`](../../examples/signed-url-download.ts) | Signed-URL HTTP download example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/http`](../../packages/http)
