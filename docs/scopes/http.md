# HTTP(S)

> HTTP(S) and signed-URL provider with ranged downloads.

## Install

```bash
npm install @zero-transfer/http
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/http"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Read-only HTTP(S) provider with HEAD-based metadata, ranged GET resume, Basic auth, Bearer-token auth via secret sources, and ETag exposed as both `uniqueId` and read-result `checksum`. Useful for signed-URL downloads and CDN ingest.

## Public surface

This is the actual surface published by [`@zero-transfer/http`](https://www.npmjs.com/package/@zero-transfer/http). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createHttpProviderFactory`](../api-md/functions/createHttpProviderFactory.md) | Function | See API reference. |
| [`HttpProviderOptions`](../api-md/interfaces/HttpProviderOptions.md) | Interface | See API reference. |
| [`HttpFetch`](../api-md/type-aliases/HttpFetch.md) | Type | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/signed-url-download.ts`](../../examples/signed-url-download.ts) | Signed-URL HTTP download example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/http`](../../packages/http)
