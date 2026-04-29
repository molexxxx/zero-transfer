# @zero-transfer/s3

> S3-compatible storage with SigV4, multipart upload, and resume.

## Install

```bash
npm install @zero-transfer/s3
```

## Overview

S3-compatible object storage provider with SigV4 signing, multipart upload, and cross-process multipart resume. Supports AWS S3, MinIO, R2, Wasabi, Backblaze B2 S3, DigitalOcean Spaces, and any custom endpoint that speaks the S3 API. Includes the in-memory resume store; persistent stores can be swapped in.

## Usage

```ts
import { createS3ProviderFactory } from "@zero-transfer/s3";
```

## Public surface

This package publishes a narrowed surface of **8** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                                    | Kind      | Notes              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`createS3ProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createS3ProviderFactory.md)                       | Function  | See API reference. |
| [`createMemoryS3MultipartResumeStore`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createMemoryS3MultipartResumeStore.md) | Function  | See API reference. |
| [`S3ProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3ProviderOptions.md)                                  | Interface | See API reference. |
| [`S3MultipartOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3MultipartOptions.md)                                | Interface | See API reference. |
| [`S3MultipartResumeStore`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3MultipartResumeStore.md)                        | Interface | See API reference. |
| [`S3MultipartResumeKey`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3MultipartResumeKey.md)                            | Interface | See API reference. |
| [`S3MultipartCheckpoint`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3MultipartCheckpoint.md)                          | Interface | See API reference. |
| [`S3MultipartPart`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/S3MultipartPart.md)                                      | Interface | See API reference. |

## Examples

| Example                                                                                                                                | What it shows                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [`examples/s3-compatible-upload.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/s3-compatible-upload.ts)           | S3-compatible multipart upload example. |
| [`examples/multi-cloud-orchestration.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/multi-cloud-orchestration.ts) | Multi-cloud orchestration showcase.     |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/s3.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
