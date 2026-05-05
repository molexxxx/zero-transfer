[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createS3ProviderFactory

# Function: createS3ProviderFactory()

```ts
function createS3ProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/S3Provider.ts:282](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L282)

Creates an S3-compatible provider factory.

Credentials must be supplied via the connection profile: `username` is the
access key id and `password` is the secret access key. `profile.host` may
be set to the bucket name (taking precedence over `options.bucket`).

Works with AWS S3 and any S3-compatible API (MinIO, Cloudflare R2,
Backblaze B2, DigitalOcean Spaces, Wasabi, etc.) via `options.endpoint`.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`S3ProviderOptions`](../interfaces/S3ProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

## Examples

```ts
import { createS3ProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createS3ProviderFactory()] });

const session = await client.connect({
  host: "my-bucket",
  provider: "s3",
  username: process.env.AWS_ACCESS_KEY_ID,
  password: { env: "AWS_SECRET_ACCESS_KEY" },
  s3: { region: "us-east-1" },
});
```

```ts
const client = createTransferClient({
  providers: [createS3ProviderFactory({
    endpoint: "https://minio.internal:9000",
    pathStyle: true,
  })],
});
```
