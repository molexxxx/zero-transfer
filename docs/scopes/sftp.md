# SFTP

> SFTP with SSH key auth, known_hosts, and jump-host support.

## Install

```bash
npm install @zero-transfer/sftp
```

## Overview

SFTP over SSH with password / private-key / agent / keyboard-interactive authentication, SSH algorithm overrides, OpenSSH `known_hosts` parsing, SHA-256 host-key pinning, custom socket factories, and a first-class jump-host helper for bastion-mediated connections.

## Public surface

This is the actual surface published by [`@zero-transfer/sftp`](https://www.npmjs.com/package/@zero-transfer/sftp). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createSftpProviderFactory`](../api-md/functions/createSftpProviderFactory.md) | Function | See API reference. |
| [`createSftpJumpHostSocketFactory`](../api-md/functions/createSftpJumpHostSocketFactory.md) | Function | See API reference. |
| [`SftpProviderOptions`](../api-md/interfaces/SftpProviderOptions.md) | Interface | See API reference. |
| [`SftpJumpHostOptions`](../api-md/interfaces/SftpJumpHostOptions.md) | Interface | See API reference. |
| [`SftpRawSession`](../api-md/interfaces/SftpRawSession.md) | Interface | See API reference. |
| [`matchKnownHosts`](../api-md/functions/matchKnownHosts.md) | Function | See API reference. |
| [`matchKnownHostsEntry`](../api-md/functions/matchKnownHostsEntry.md) | Function | See API reference. |
| [`parseKnownHosts`](../api-md/functions/parseKnownHosts.md) | Function | See API reference. |
| [`KnownHostsEntry`](../api-md/interfaces/KnownHostsEntry.md) | Interface | See API reference. |
| [`KnownHostsMarker`](../api-md/type-aliases/KnownHostsMarker.md) | Type | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/sftp-private-key.ts`](../../examples/sftp-private-key.ts) | SFTP private-key authentication example with host-key pinning. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/sftp`](../../packages/sftp)
