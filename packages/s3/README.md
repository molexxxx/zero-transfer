# @zero-transfer/s3

> S3-compatible storage with SigV4, multipart upload, and resume.

S3-compatible object storage provider with SigV4 signing, multipart upload, and cross-process multipart resume. Supports AWS S3, MinIO, R2, Wasabi, Backblaze B2 S3, DigitalOcean Spaces, and any custom endpoint that speaks the S3 API. Includes the in-memory resume store; persistent stores can be swapped in.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/s3
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/s3";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/s3.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
