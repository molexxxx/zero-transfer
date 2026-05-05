# @zero-transfer/classic

> FTP, FTPS, and SFTP providers in one install.

## Install

```bash
npm install @zero-transfer/classic
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/classic"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers. Zero runtime dependencies — SFTP is implemented on top of the first-party native SSH stack.

## Usage

```ts
import {
  createTransferClient,
  uploadFile,
  downloadFile,
  createFtpProviderFactory,
} from "@zero-transfer/classic";
```

## Public surface

This package publishes a narrowed surface of **6** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                  | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpProviderFactory.md)   | Function  | See API reference. |
| [`createFtpsProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpsProviderFactory.md) | Function  | See API reference. |
| [`createSftpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpProviderFactory.md) | Function  | See API reference. |
| [`FtpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpProviderOptions.md)              | Interface | See API reference. |
| [`FtpsProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpsProviderOptions.md)            | Interface | See API reference. |
| [`SftpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpProviderOptions.md)            | Interface | See API reference. |

## Examples

| Example                                                                                                                            | What it shows                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`examples/sftp-private-key.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-private-key.ts)               | SFTP private-key authentication example with host-key pinning.         |
| [`examples/ftps-client-certificate.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/classic.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
