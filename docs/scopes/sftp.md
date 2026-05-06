# SFTP

> Zero-dependency SFTP over SSH with a first-party SSH transport stack.

## Install

```bash
npm install @zero-transfer/sftp
```

## Overview

Zero-dependency SFTP over SSH built on a first-party SSH transport stack: Ed25519 / RSA-SHA2-256/512 / ECDSA P-256/384/521 host keys, password / keyboard-interactive / public-key (Ed25519 + RSA) auth, host-key pinning, OpenSSH `known_hosts` (hashed/plain, `[host]:port`, `@revoked`), handshake timeout, and idle NAT keepalive.

## Public surface

This is the actual surface published by [`@zero-transfer/sftp`](https://www.npmjs.com/package/@zero-transfer/sftp). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`createSftpProviderFactory`](../api-md/functions/createSftpProviderFactory.md) | Function | See API reference. |
| [`SftpProviderOptions`](../api-md/interfaces/SftpProviderOptions.md) | Interface | See API reference. |
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
| [`examples/sftp-directory-ops.ts`](../../examples/sftp-directory-ops.ts) | SFTP directory operations: list, stat, mkdir, rename, remove, rmdir. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/sftp`](../../packages/sftp)
