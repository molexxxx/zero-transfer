# FTPS

> Explicit and implicit FTPS with full TLS profile support.

## Install

```bash
npm install @zero-transfer/ftps
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/ftps"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.

## Public surface

This is the actual surface published by [`@zero-transfer/ftps`](https://www.npmjs.com/package/@zero-transfer/ftps). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createFtpsProviderFactory`](../api-md/functions/createFtpsProviderFactory.md) | Function | See API reference. |
| [`FtpsProviderOptions`](../api-md/interfaces/FtpsProviderOptions.md) | Interface | See API reference. |
| [`FtpsMode`](../api-md/type-aliases/FtpsMode.md) | Type | See API reference. |
| [`FtpsDataProtection`](../api-md/type-aliases/FtpsDataProtection.md) | Type | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/ftps-client-certificate.ts`](../../examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/ftps`](../../packages/ftps)
