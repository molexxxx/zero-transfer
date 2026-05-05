# FTP

> Classic FTP provider with EPSV/PASV streaming and REST resume.

## Install

```bash
npm install @zero-transfer/ftp
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/ftp"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Plain FTP with EPSV/PASV streaming, REST-resume, MLST/MLSD listings, Unix LIST fallback, and full profile timeout enforcement. Use `createFtpProviderFactory()`.

## Public surface

This is the actual surface published by [`@zero-transfer/ftp`](https://www.npmjs.com/package/@zero-transfer/ftp). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createFtpProviderFactory`](../api-md/functions/createFtpProviderFactory.md) | Function | See API reference. |
| [`FtpProviderOptions`](../api-md/interfaces/FtpProviderOptions.md) | Interface | See API reference. |
| [`FtpPassiveHostStrategy`](../api-md/type-aliases/FtpPassiveHostStrategy.md) | Type | See API reference. |
| [`FtpResponse`](../api-md/interfaces/FtpResponse.md) | Interface | See API reference. |
| [`FtpResponseStatus`](../api-md/type-aliases/FtpResponseStatus.md) | Type | See API reference. |
| [`FtpFeatures`](../api-md/interfaces/FtpFeatures.md) | Interface | See API reference. |
| [`FtpResponseParser`](../api-md/classes/FtpResponseParser.md) | Class | See API reference. |
| [`parseFtpFeatures`](../api-md/functions/parseFtpFeatures.md) | Function | See API reference. |
| [`parseFtpResponseLines`](../api-md/functions/parseFtpResponseLines.md) | Function | See API reference. |
| [`parseMlsdLine`](../api-md/functions/parseMlsdLine.md) | Function | See API reference. |
| [`parseMlsdList`](../api-md/functions/parseMlsdList.md) | Function | See API reference. |
| [`parseMlstTimestamp`](../api-md/functions/parseMlstTimestamp.md) | Function | See API reference. |
| [`parseUnixList`](../api-md/functions/parseUnixList.md) | Function | See API reference. |
| [`parseUnixListLine`](../api-md/functions/parseUnixListLine.md) | Function | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/ftp-basic.ts`](../../examples/ftp-basic.ts) | Basic FTP upload + download example. |
| [`examples/transfer-queue.ts`](../../examples/transfer-queue.ts) | Transfer queue with concurrency, progress, and per-job receipts. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/ftp`](../../packages/ftp)
