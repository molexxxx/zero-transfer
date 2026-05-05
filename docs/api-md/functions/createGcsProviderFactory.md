[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createGcsProviderFactory

# Function: createGcsProviderFactory()

```ts
function createGcsProviderFactory(options): ProviderFactory;
```

Defined in: [src/providers/cloud/GcsProvider.ts:99](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L99)

Creates a Google Cloud Storage provider factory.

Authentication is per-connection: pass a Google OAuth 2 access token via
`profile.password`. `profile.host` is unused - the bucket is fixed at
factory construction time so a single client can target multiple buckets
by registering separate factories.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`GcsProviderOptions`](../interfaces/GcsProviderOptions.md) | Bucket plus optional fetch/transport overrides. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createGcsProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createGcsProviderFactory({ bucket: "my-bucket" })],
});

await uploadFile({
  client,
  localPath: "./build/app.tar.gz",
  destination: {
    path: "releases/2026.04/app.tar.gz",
    profile: {
      host: "my-bucket",
      provider: "gcs",
      password: { env: "GCP_OAUTH_ACCESS_TOKEN" },
    },
  },
});
```
