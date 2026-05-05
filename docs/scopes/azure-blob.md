# Azure Blob

> Azure Blob Storage with SAS / AAD auth and staged-block uploads.

## Install

```bash
npm install @zero-transfer/azure-blob
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/azure-blob"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Azure Blob Storage provider - SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, staged-block (multipart) uploads via `Put Block` + `Put Block List` with single-shot fallback under threshold, and `content-md5` exposed as `checksum`. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

## Public surface

This is the actual surface published by [`@zero-transfer/azure-blob`](https://www.npmjs.com/package/@zero-transfer/azure-blob). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createAzureBlobProviderFactory`](../api-md/functions/createAzureBlobProviderFactory.md) | Function | See API reference. |
| [`AzureBlobProviderOptions`](../api-md/interfaces/AzureBlobProviderOptions.md) | Interface | See API reference. |
| [`AzureBlobMultipartOptions`](../api-md/interfaces/AzureBlobMultipartOptions.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/multi-cloud-orchestration.ts`](../../examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/azure-blob`](../../packages/azure-blob)
