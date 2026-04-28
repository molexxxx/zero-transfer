# FTPS

> Explicit and implicit FTPS with full TLS profile support.

## Install

```bash
npm install @zero-transfer/ftps
```

## Overview

FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                          | Kind      | Notes              |
| ------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpsProviderFactory`](../api-md/functions/createFtpsProviderFactory.md) | Function  | See API reference. |
| [`FtpsProviderOptions`](../api-md/interfaces/FtpsProviderOptions.md)            | Interface | See API reference. |
| [`FtpsMode`](../api-md/type-aliases/FtpsMode.md)                                | Type      | See API reference. |
| [`FtpsDataProtection`](../api-md/type-aliases/FtpsDataProtection.md)            | Type      | See API reference. |

## Examples

| Example                                                                            | What it shows                                 |
| ---------------------------------------------------------------------------------- | --------------------------------------------- |
| [`examples/ftps-client-certificate.ts`](../../examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/ftps`](../../packages/ftps)
