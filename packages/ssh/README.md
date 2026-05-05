# @zero-transfer/ssh

> Zero-dependency SSH 2.0 transport, auth, and channel primitives.

## Install

```bash
npm install @zero-transfer/ssh
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/ssh"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Standalone, zero-dependency SSH 2.0 stack - RFC 4253 transport (curve25519-sha256 KEX, AES-CTR + HMAC-SHA2), RFC 4252 user authentication (password, keyboard-interactive, publickey for Ed25519 / RSA-SHA2-256/512), RFC 5656 ECDSA host keys (P-256/384/521), RFC 4254 channels, OpenSSH `known_hosts` parsing, and host-key pinning. The same protocol stack that powers the SFTP provider, exposed for callers that need direct SSH features (custom subsystems, exec channels, port forwarding, custom RPC) - capabilities the Node.js ecosystem otherwise lacks a maintained pure-JS solution for.

## Usage

```ts
import {
  SshTransportConnection,
  SshTransportConnectionOptions,
  SshTransportHandshake,
} from "@zero-transfer/ssh";
```

## Public surface

This package publishes a narrowed surface of **26** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                                  | Kind      | Notes              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`SshTransportConnection`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshTransportConnection.md)                         | Class     | See API reference. |
| [`SshTransportConnectionOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshTransportConnectionOptions.md)        | Interface | See API reference. |
| [`SshTransportHandshake`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshTransportHandshake.md)                           | Class     | See API reference. |
| [`SshTransportHandshakeResult`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshTransportHandshakeResult.md)            | Interface | See API reference. |
| [`SshDisconnectReason`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/SshDisconnectReason.md)                          | Type      | See API reference. |
| [`SshAlgorithmPreferences`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshAlgorithmPreferences.md)                    | Interface | See API reference. |
| [`NegotiatedSshAlgorithms`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/NegotiatedSshAlgorithms.md)                    | Interface | See API reference. |
| [`DEFAULT_SSH_ALGORITHM_PREFERENCES`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/variables/DEFAULT_SSH_ALGORITHM_PREFERENCES.md) | Variable  | See API reference. |
| [`negotiateSshAlgorithms`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/negotiateSshAlgorithms.md)                       | Function  | See API reference. |
| [`SshAuthSession`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshAuthSession.md)                                         | Class     | See API reference. |
| [`SshPasswordCredential`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshPasswordCredential.md)                        | Interface | See API reference. |
| [`SshPublickeyCredential`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshPublickeyCredential.md)                      | Interface | See API reference. |
| [`SshKeyboardInteractiveCredential`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SshKeyboardInteractiveCredential.md)  | Interface | See API reference. |
| [`buildPublickeyCredential`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/buildPublickeyCredential.md)                   | Function  | See API reference. |
| [`SshConnectionManager`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshConnectionManager.md)                             | Class     | See API reference. |
| [`SshSessionChannel`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshSessionChannel.md)                                   | Class     | See API reference. |
| [`SshDataReader`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshDataReader.md)                                           | Class     | See API reference. |
| [`SshDataWriter`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/SshDataWriter.md)                                           | Class     | See API reference. |
| [`parseKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseKnownHosts.md)                                     | Function  | See API reference. |
| [`matchKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHosts.md)                                     | Function  | See API reference. |
| [`matchKnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHostsEntry.md)                           | Function  | See API reference. |
| [`KnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/KnownHostsEntry.md)                                    | Interface | See API reference. |
| [`KnownHostsMarker`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/KnownHostsMarker.md)                                | Type      | See API reference. |
| [`runSshCommand`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/runSshCommand.md)                                         | Function  | See API reference. |
| [`RunSshCommandOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RunSshCommandOptions.md)                          | Interface | See API reference. |
| [`RunSshCommandResult`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RunSshCommandResult.md)                            | Interface | See API reference. |

## Examples

| Example                                                                                                              | What it shows                                                               |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`examples/ssh-exec-command.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ssh-exec-command.ts) | SSH remote command execution via the standalone `@zero-transfer/ssh` stack. |
| [`examples/sftp-private-key.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/sftp-private-key.ts) | SFTP private-key authentication example with host-key pinning.              |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ssh.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
