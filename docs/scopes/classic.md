# Classic — FTP / FTPS / SFTP

> FTP, FTPS, and SFTP providers in one install.

## Install

```bash
npm install @zero-transfer/classic
```

## Overview

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.

## Public surface

This is the actual surface published by [`@zero-transfer/classic`](https://www.npmjs.com/package/@zero-transfer/classic). Every symbol is re-exported from [`@zero-transfer/sdk`](../api-md/README.md) and links into the full API reference:

| Symbol                                                                                      | Kind      | Notes              |
| ------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createFtpProviderFactory`](../api-md/functions/createFtpProviderFactory.md)               | Function  | See API reference. |
| [`createFtpsProviderFactory`](../api-md/functions/createFtpsProviderFactory.md)             | Function  | See API reference. |
| [`createSftpProviderFactory`](../api-md/functions/createSftpProviderFactory.md)             | Function  | See API reference. |
| [`createSftpJumpHostSocketFactory`](../api-md/functions/createSftpJumpHostSocketFactory.md) | Function  | See API reference. |
| [`FtpProviderOptions`](../api-md/interfaces/FtpProviderOptions.md)                          | Interface | See API reference. |
| [`FtpsProviderOptions`](../api-md/interfaces/FtpsProviderOptions.md)                        | Interface | See API reference. |
| [`SftpProviderOptions`](../api-md/interfaces/SftpProviderOptions.md)                        | Interface | See API reference. |
| [`SftpJumpHostOptions`](../api-md/interfaces/SftpJumpHostOptions.md)                        | Interface | See API reference. |

## Examples

| Example                                                                            | What it shows                                                          |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`examples/sftp-private-key.ts`](../../examples/sftp-private-key.ts)               | SFTP private-key authentication example with host-key pinning.         |
| [`examples/ftps-client-certificate.ts`](../../examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example with certificate pinning. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/classic`](../../packages/classic)
