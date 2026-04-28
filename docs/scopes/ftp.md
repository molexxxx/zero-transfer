# FTP

> Classic FTP provider with EPSV/PASV streaming and REST resume.

## Install

```bash
npm install @zero-transfer/ftp
```

## Overview

Plain FTP with EPSV/PASV streaming, REST-resume, MLST/MLSD listings, Unix LIST fallback, and full profile timeout enforcement. Use `createFtpProviderFactory()`.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                        | Kind      | Notes              |
| ----------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpProviderFactory`](../api-md/functions/createFtpProviderFactory.md) | Function  | See API reference. |
| [`FtpProviderOptions`](../api-md/interfaces/FtpProviderOptions.md)            | Interface | See API reference. |
| [`FtpPassiveHostStrategy`](../api-md/type-aliases/FtpPassiveHostStrategy.md)  | Type      | See API reference. |
| [`FtpResponse`](../api-md/interfaces/FtpResponse.md)                          | Interface | See API reference. |
| [`FtpResponseStatus`](../api-md/type-aliases/FtpResponseStatus.md)            | Type      | See API reference. |
| [`FtpFeatures`](../api-md/interfaces/FtpFeatures.md)                          | Interface | See API reference. |
| [`FtpResponseParser`](../api-md/classes/FtpResponseParser.md)                 | Class     | See API reference. |
| [`parseFtpFeatures`](../api-md/functions/parseFtpFeatures.md)                 | Function  | See API reference. |
| [`parseFtpResponseLines`](../api-md/functions/parseFtpResponseLines.md)       | Function  | See API reference. |
| [`parseMlsdLine`](../api-md/functions/parseMlsdLine.md)                       | Function  | See API reference. |
| [`parseMlsdList`](../api-md/functions/parseMlsdList.md)                       | Function  | See API reference. |
| [`parseMlstTimestamp`](../api-md/functions/parseMlstTimestamp.md)             | Function  | See API reference. |
| [`parseUnixList`](../api-md/functions/parseUnixList.md)                       | Function  | See API reference. |
| [`parseUnixListLine`](../api-md/functions/parseUnixListLine.md)               | Function  | See API reference. |

## Examples

| Example                                                          | What it shows                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`examples/transfer-queue.ts`](../../examples/transfer-queue.ts) | Transfer queue with concurrency, progress, and per-job receipts. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/ftp`](../../packages/ftp)
