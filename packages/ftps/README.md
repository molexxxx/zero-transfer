# @zero-transfer/ftps

> Explicit and implicit FTPS with full TLS profile support.

## Install

```bash
npm install @zero-transfer/ftps
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/ftps"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.

## Usage

```ts
import {
  createTransferClient,
  uploadFile,
  downloadFile,
  createFtpsProviderFactory,
} from "@zero-transfer/ftps";
```

## Public surface

This package publishes a narrowed surface of **4** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                  | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpsProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpsProviderFactory.md) | Function  | See API reference. |
| [`FtpsProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpsProviderOptions.md)            | Interface | See API reference. |
| [`FtpsMode`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpsMode.md)                                | Type      | See API reference. |
| [`FtpsDataProtection`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpsDataProtection.md)            | Type      | See API reference. |

## Examples

| Example                                                                                                                            | What it shows                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`examples/ftps-client-certificate.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ftps.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
