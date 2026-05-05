# SSH - standalone protocol stack

> Zero-dependency SSH 2.0 transport, auth, and channel primitives.

## Install

```bash
npm install @zero-transfer/ssh
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/ssh"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Standalone, zero-dependency SSH 2.0 stack - RFC 4253 transport (curve25519-sha256 KEX, AES-CTR + HMAC-SHA2), RFC 4252 user authentication (password, keyboard-interactive, publickey for Ed25519 / RSA-SHA2-256/512), RFC 5656 ECDSA host keys (P-256/384/521), RFC 4254 channels, OpenSSH `known_hosts` parsing, and host-key pinning. The same protocol stack that powers the SFTP provider, exposed for callers that need direct SSH features (custom subsystems, exec channels, port forwarding, custom RPC) - capabilities the Node.js ecosystem otherwise lacks a maintained pure-JS solution for.

## Public surface

This is the actual surface published by [`@zero-transfer/ssh`](https://www.npmjs.com/package/@zero-transfer/ssh). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`SshTransportConnection`](../api-md/classes/SshTransportConnection.md) | Class | See API reference. |
| [`SshTransportConnectionOptions`](../api-md/interfaces/SshTransportConnectionOptions.md) | Interface | See API reference. |
| [`SshTransportHandshake`](../api-md/classes/SshTransportHandshake.md) | Class | See API reference. |
| [`SshTransportHandshakeResult`](../api-md/interfaces/SshTransportHandshakeResult.md) | Interface | See API reference. |
| [`SshDisconnectReason`](../api-md/type-aliases/SshDisconnectReason.md) | Type | See API reference. |
| [`SshAlgorithmPreferences`](../api-md/interfaces/SshAlgorithmPreferences.md) | Interface | See API reference. |
| [`NegotiatedSshAlgorithms`](../api-md/interfaces/NegotiatedSshAlgorithms.md) | Interface | See API reference. |
| [`DEFAULT_SSH_ALGORITHM_PREFERENCES`](../api-md/variables/DEFAULT_SSH_ALGORITHM_PREFERENCES.md) | Variable | See API reference. |
| [`negotiateSshAlgorithms`](../api-md/functions/negotiateSshAlgorithms.md) | Function | See API reference. |
| [`SshAuthSession`](../api-md/classes/SshAuthSession.md) | Class | See API reference. |
| [`SshPasswordCredential`](../api-md/interfaces/SshPasswordCredential.md) | Interface | See API reference. |
| [`SshPublickeyCredential`](../api-md/interfaces/SshPublickeyCredential.md) | Interface | See API reference. |
| [`SshKeyboardInteractiveCredential`](../api-md/interfaces/SshKeyboardInteractiveCredential.md) | Interface | See API reference. |
| [`buildPublickeyCredential`](../api-md/functions/buildPublickeyCredential.md) | Function | See API reference. |
| [`SshConnectionManager`](../api-md/classes/SshConnectionManager.md) | Class | See API reference. |
| [`SshSessionChannel`](../api-md/classes/SshSessionChannel.md) | Class | See API reference. |
| [`SshDataReader`](../api-md/classes/SshDataReader.md) | Class | See API reference. |
| [`SshDataWriter`](../api-md/classes/SshDataWriter.md) | Class | See API reference. |
| [`parseKnownHosts`](../api-md/functions/parseKnownHosts.md) | Function | See API reference. |
| [`matchKnownHosts`](../api-md/functions/matchKnownHosts.md) | Function | See API reference. |
| [`matchKnownHostsEntry`](../api-md/functions/matchKnownHostsEntry.md) | Function | See API reference. |
| [`KnownHostsEntry`](../api-md/interfaces/KnownHostsEntry.md) | Interface | See API reference. |
| [`KnownHostsMarker`](../api-md/type-aliases/KnownHostsMarker.md) | Type | See API reference. |
| [`runSshCommand`](../api-md/functions/runSshCommand.md) | Function | See API reference. |
| [`RunSshCommandOptions`](../api-md/interfaces/RunSshCommandOptions.md) | Interface | See API reference. |
| [`RunSshCommandResult`](../api-md/interfaces/RunSshCommandResult.md) | Interface | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/ssh-exec-command.ts`](../../examples/ssh-exec-command.ts) | SSH remote command execution via the standalone `@zero-transfer/ssh` stack. |
| [`examples/sftp-private-key.ts`](../../examples/sftp-private-key.ts) | SFTP private-key authentication example with host-key pinning. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/ssh`](../../packages/ssh)
