# Azure Blob

> Azure Blob Storage with SAS or AAD bearer auth.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Overview

Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

## Public surface

This is the actual surface published by [`@zero-transfer/azure-blob`](https://www.npmjs.com/package/@zero-transfer/azure-blob). Every symbol is re-exported from [`@zero-transfer/sdk`](../api-md/README.md) and links into the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createAzureBlobProviderFactory`](../api-md/functions/createAzureBlobProviderFactory.md) | Function | See API reference. |
| [`AzureBlobProviderOptions`](../api-md/interfaces/AzureBlobProviderOptions.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/multi-cloud-orchestration.ts`](../../examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/azure-blob`](../../packages/azure-blob)
