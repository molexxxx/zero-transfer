# @zero-transfer/azure-blob

> Azure Blob Storage with SAS or AAD bearer auth.

Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Usage

```ts
import { createAzureBlobProviderFactory } from "@zero-transfer/azure-blob";
```

## Public surface

This package narrows the SDK to **2** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/azure-blob.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/azure-blob.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
