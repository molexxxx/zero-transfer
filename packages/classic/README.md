# @zero-transfer/classic

> FTP, FTPS, and SFTP providers in one install.

Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.

## Install

```bash
npm install @zero-transfer/classic
```

## Usage

```ts
import { createFtpProviderFactory } from "@zero-transfer/classic";
```

## Public surface

This package narrows the SDK to **8** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/classic.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/classic.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
