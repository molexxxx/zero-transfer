# @zero-transfer/s3

> S3-compatible storage with SigV4, multipart upload, and resume.

S3-compatible object storage provider with SigV4 signing, multipart upload, and cross-process multipart resume. Supports AWS S3, MinIO, R2, Wasabi, Backblaze B2 S3, DigitalOcean Spaces, and any custom endpoint that speaks the S3 API. Includes the in-memory resume store; persistent stores can be swapped in.

## Install

```bash
npm install @zero-transfer/s3
```

## Usage

```ts
import { createS3ProviderFactory } from "@zero-transfer/s3";
```

## Public surface

This package narrows the SDK to **8** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/s3.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/s3.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
