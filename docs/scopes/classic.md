# Classic — FTP / FTPS / SFTP

> FTP, FTPS, and SFTP providers in one install.

## Install

```bash
npm install @zero-transfer/classic
```

## Overview

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

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

| Example                                                                            | What it shows                                 |
| ---------------------------------------------------------------------------------- | --------------------------------------------- |
| [`examples/sftp-private-key.ts`](../../examples/sftp-private-key.ts)               | SFTP private-key authentication example.      |
| [`examples/ftps-client-certificate.ts`](../../examples/ftps-client-certificate.ts) | FTPS client-certificate (mutual TLS) example. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/classic`](../../packages/classic)
