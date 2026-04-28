# @zero-transfer/core

> Provider-neutral contracts, transfer engine, queue, profiles, and errors.

The provider-neutral foundation: `TransferClient`, `createTransferClient`, the provider registry, capability sets, transfer engine, queue, planning primitives, profile resolution, secret redaction, structured logging, and typed errors. Every other scoped package builds on this surface.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/core
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/core";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/core.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
