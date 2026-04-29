# @zero-transfer/ftps

> Explicit and implicit FTPS with full TLS profile support.

## Install

```bash
npm install @zero-transfer/ftps
```

## Overview

FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.

## Usage

```ts
import { createFtpsProviderFactory } from "@zero-transfer/ftps";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **4** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createFtpsProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpsProviderFactory.md) | Function | See API reference. |
| [`FtpsProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpsProviderOptions.md) | Interface | See API reference. |
| [`FtpsMode`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpsMode.md) | Type | See API reference. |
| [`FtpsDataProtection`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpsDataProtection.md) | Type | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/ftps-client-certificate.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ftps.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
