[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAzureBlobProviderFactory

# Function: createAzureBlobProviderFactory()

```ts
function createAzureBlobProviderFactory(options): ProviderFactory;
```

Defined in: [src/providers/cloud/AzureBlobProvider.ts:115](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/AzureBlobProvider.ts#L115)

Creates an Azure Blob Storage provider factory.

The container is fixed at factory construction time. Authenticate per-connection
with either a SAS token (configured at factory level via [AzureBlobProviderOptions.sasToken](../interfaces/AzureBlobProviderOptions.md#sastoken))
or an AAD bearer token resolved from `profile.password`. Override `endpoint` for
sovereign clouds or local Azurite testing.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`AzureBlobProviderOptions`](../interfaces/AzureBlobProviderOptions.md) | Container plus optional endpoint, SAS token, fetch override. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Examples

```ts
import { createAzureBlobProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createAzureBlobProviderFactory({ container: "snapshots" })],
});

await uploadFile({
  client,
  localPath: "./snapshots/2026-04-28.tar.zst",
  destination: {
    path: "/2026/04/28/snapshot.tar.zst",
    profile: {
      host: "mystorageacct",
      provider: "azure-blob",
      password: { env: "AZURE_AAD_TOKEN" },
    },
  },
});
```

```ts
createAzureBlobProviderFactory({
  container: "devstoreaccount1",
  endpoint: "http://127.0.0.1:10000/devstoreaccount1",
  sasToken: "sv=2024-11-04&ss=b&srt=co&sp=rwdlac&se=...",
});
```
