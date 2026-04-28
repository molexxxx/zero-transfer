# @zero-transfer/classic

> FTP, FTPS, and SFTP providers in one install.

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/classic
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/classic";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/classic.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
