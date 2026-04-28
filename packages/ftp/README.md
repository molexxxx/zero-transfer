# @zero-transfer/ftp

> Classic FTP provider with EPSV/PASV streaming and REST resume.

Plain FTP with EPSV/PASV streaming, REST-resume, MLST/MLSD listings, Unix LIST fallback, and full profile timeout enforcement. Use `createFtpProviderFactory()`.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/ftp
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/ftp";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/ftp.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
