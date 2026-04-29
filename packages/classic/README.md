# @zero-transfer/classic

> FTP, FTPS, and SFTP providers in one install.

## Install

```bash
npm install @zero-transfer/classic
```

## Overview

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.

## Usage

```ts
import { createFtpProviderFactory } from "@zero-transfer/classic";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **8** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createFtpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpProviderFactory.md) | Function | See API reference. |
| [`createFtpsProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createFtpsProviderFactory.md) | Function | See API reference. |
| [`createSftpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpProviderFactory.md) | Function | See API reference. |
| [`createSftpJumpHostSocketFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpJumpHostSocketFactory.md) | Function | See API reference. |
| [`FtpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpProviderOptions.md) | Interface | See API reference. |
| [`FtpsProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/FtpsProviderOptions.md) | Interface | See API reference. |
| [`SftpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpProviderOptions.md) | Interface | See API reference. |
| [`SftpJumpHostOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpJumpHostOptions.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/sftp-private-key.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-private-key.ts) | SFTP private-key authentication example with host-key pinning. |
| [`examples/ftps-client-certificate.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/classic.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
