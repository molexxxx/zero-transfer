# @zero-transfer/sftp

> Zero-dependency SFTP over SSH with a first-party SSH transport stack.

## Install

```bash
npm install @zero-transfer/sftp
```

Installing this package automatically pulls in [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core) as a transitive dependency. The full core surface (`createTransferClient`, `uploadFile`, `downloadFile`, profiles, errors, sync planner, …) is re-exported from this package, so a single `import { … } from "@zero-transfer/sftp"` is all you need. If your app uses multiple protocols, install the umbrella [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) instead of multiple scoped packages.

## Overview

Zero-dependency SFTP over SSH built on a first-party SSH transport stack: Ed25519 / RSA-SHA2-256/512 / ECDSA P-256/384/521 host keys, password / keyboard-interactive / public-key (Ed25519 + RSA) auth, host-key pinning, OpenSSH `known_hosts` (hashed/plain, `[host]:port`, `@revoked`), handshake timeout, and idle NAT keepalive. `createSftpProviderFactory` is kept as an alias of `createNativeSftpProviderFactory` for backward compatibility.

## Usage

```ts
import {
  createTransferClient,
  uploadFile,
  downloadFile,
  createNativeSftpProviderFactory,
} from "@zero-transfer/sftp";
```

## Public surface

This package publishes a narrowed surface of **11** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                  | Kind         | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------ |
| `createNativeSftpProviderFactory`                                                                                                       | _unresolved_ | —                  |
| `NativeSftpProviderOptions`                                                                                                             | _unresolved_ | —                  |
| `NativeSftpRawSession`                                                                                                                  | _unresolved_ | —                  |
| [`createSftpProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSftpProviderFactory.md) | Function     | See API reference. |
| [`SftpProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpProviderOptions.md)            | Interface    | See API reference. |
| [`SftpRawSession`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/SftpRawSession.md)                      | Interface    | See API reference. |
| [`matchKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHosts.md)                     | Function     | See API reference. |
| [`matchKnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/matchKnownHostsEntry.md)           | Function     | See API reference. |
| [`parseKnownHosts`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseKnownHosts.md)                     | Function     | See API reference. |
| [`KnownHostsEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/KnownHostsEntry.md)                    | Interface    | See API reference. |
| [`KnownHostsMarker`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/KnownHostsMarker.md)                | Type         | See API reference. |

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
