# @zero-transfer/ftp

> Classic FTP provider with EPSV/PASV streaming and REST resume.

## Install

```bash
npm install @zero-transfer/ftp
```

## Overview

Plain FTP with EPSV/PASV streaming, REST-resume, MLST/MLSD listings, Unix LIST fallback, and full profile timeout enforcement. Use `createFtpProviderFactory()`.

## Usage

```ts
import { createFtpProviderFactory } from "@zero-transfer/ftp";
```

## Public surface

This package publishes a narrowed surface of **14** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                | Kind      | Notes              |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpProviderFactory.md) | Function  | See API reference. |
| [`FtpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpProviderOptions.md)            | Interface | See API reference. |
| [`FtpPassiveHostStrategy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpPassiveHostStrategy.md)  | Type      | See API reference. |
| [`FtpResponse`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpResponse.md)                          | Interface | See API reference. |
| [`FtpResponseStatus`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FtpResponseStatus.md)            | Type      | See API reference. |
| [`FtpFeatures`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpFeatures.md)                          | Interface | See API reference. |
| [`FtpResponseParser`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/FtpResponseParser.md)                 | Class     | See API reference. |
| [`parseFtpFeatures`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseFtpFeatures.md)                 | Function  | See API reference. |
| [`parseFtpResponseLines`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseFtpResponseLines.md)       | Function  | See API reference. |
| [`parseMlsdLine`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseMlsdLine.md)                       | Function  | See API reference. |
| [`parseMlsdList`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseMlsdList.md)                       | Function  | See API reference. |
| [`parseMlstTimestamp`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseMlstTimestamp.md)             | Function  | See API reference. |
| [`parseUnixList`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseUnixList.md)                       | Function  | See API reference. |
| [`parseUnixListLine`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseUnixListLine.md)               | Function  | See API reference. |

## Examples

| Example                                                                                                          | What it shows                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`examples/ftp-basic.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftp-basic.ts)           | Basic FTP upload + download example.                             |
| [`examples/transfer-queue.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/transfer-queue.ts) | Transfer queue with concurrency, progress, and per-job receipts. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ftp.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
