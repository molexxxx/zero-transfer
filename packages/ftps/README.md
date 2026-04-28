# @zero-transfer/ftps

> Explicit and implicit FTPS with full TLS profile support.

FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/ftps
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/ftps";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ftps.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
