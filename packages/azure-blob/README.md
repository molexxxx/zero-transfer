# @zero-transfer/azure-blob

Azure Blob Storage provider for ZeroTransfer.

> **Alpha umbrella package.** This package currently re-exports the entire
> [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk)
> public surface. Future releases will narrow this package to only its
> dedicated subset (see the
> [ZeroTransfer remake plan](https://github.com/tonywied17/zero-transfer/blob/main/zero-transfer-remake.md#future-monorepo-shape)).
> If you want every provider in one install today, depend on
> `@zero-transfer/sdk` directly.

## Install

```bash
npm install @zero-transfer/azure-blob
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/azure-blob";

const client = createTransferClient();
```

See the [main README](https://github.com/tonywied17/zero-transfer#readme) for
full documentation.

## License

MIT © Tony Wiedman
