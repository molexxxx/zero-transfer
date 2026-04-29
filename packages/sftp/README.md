# @zero-transfer/sftp

> SFTP with SSH key auth, known_hosts, and jump-host support.

## Install

```bash
npm install @zero-transfer/sftp
```

## Overview

SFTP over SSH with password / private-key / agent / keyboard-interactive authentication, SSH algorithm overrides, OpenSSH `known_hosts` parsing, SHA-256 host-key pinning, custom socket factories, and a first-class jump-host helper for bastion-mediated connections.

## Usage

```ts
import { createSftpProviderFactory } from "@zero-transfer/sftp";
```

## Public surface

This package publishes a narrowed surface of **10** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                              | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createSftpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpProviderFactory.md)             | Function  | See API reference. |
| [`createSftpJumpHostSocketFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpJumpHostSocketFactory.md) | Function  | See API reference. |
| [`SftpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpProviderOptions.md)                        | Interface | See API reference. |
| [`SftpJumpHostOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpJumpHostOptions.md)                        | Interface | See API reference. |
| [`SftpRawSession`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpRawSession.md)                                  | Interface | See API reference. |
| [`matchKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHosts.md)                                 | Function  | See API reference. |
| [`matchKnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHostsEntry.md)                       | Function  | See API reference. |
| [`parseKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseKnownHosts.md)                                 | Function  | See API reference. |
| [`KnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/KnownHostsEntry.md)                                | Interface | See API reference. |
| [`KnownHostsMarker`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/KnownHostsMarker.md)                            | Type      | See API reference. |

## Examples

| Example                                                                                                              | What it shows                                                  |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`examples/sftp-private-key.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-private-key.ts) | SFTP private-key authentication example with host-key pinning. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/sftp.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
