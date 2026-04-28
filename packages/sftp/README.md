# @zero-transfer/sftp

> SFTP with SSH key auth, known_hosts, and jump-host support.

SFTP over SSH with password / private-key / agent / keyboard-interactive authentication, SSH algorithm overrides, OpenSSH `known_hosts` parsing, SHA-256 host-key pinning, custom socket factories, and a first-class jump-host helper for bastion-mediated connections.

## Install

```bash
npm install @zero-transfer/sftp
```

## Usage

```ts
import { createSftpProviderFactory } from "@zero-transfer/sftp";
```

## Public surface

This package narrows the SDK to **10** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/sftp.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/sftp.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
