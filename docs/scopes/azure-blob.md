# Azure Blob

> Azure Blob Storage with SAS or AAD bearer auth.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Overview

Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                                    | Kind      | Notes              |
| ----------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createAzureBlobProviderFactory`](../api-md/functions/createAzureBlobProviderFactory.md) | Function  | See API reference. |
| [`AzureBlobProviderOptions`](../api-md/interfaces/AzureBlobProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                                                | What it shows                       |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| [`examples/multi-cloud-orchestration.ts`](../../examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/azure-blob`](../../packages/azure-blob)
