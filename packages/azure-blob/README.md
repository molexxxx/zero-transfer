# @zero-transfer/azure-blob

> Azure Blob Storage with SAS or AAD bearer auth.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Overview

Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

## Usage

```ts
import { createAzureBlobProviderFactory } from "@zero-transfer/azure-blob";
```

## Public surface

This package publishes a narrowed surface of **2** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                            | Kind      | Notes              |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createAzureBlobProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createAzureBlobProviderFactory.md) | Function  | See API reference. |
| [`AzureBlobProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/AzureBlobProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                                                                                                | What it shows                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [`examples/multi-cloud-orchestration.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/azure-blob.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
