# @zero-transfer/azure-blob

> Azure Blob Storage with SAS or AAD bearer auth.

Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/azure-blob";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/azure-blob.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
