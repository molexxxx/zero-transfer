[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAzureBlobProviderFactory

# Function: createAzureBlobProviderFactory()

```ts
function createAzureBlobProviderFactory(options): ProviderFactory;
```

Defined in: [src/providers/cloud/AzureBlobProvider.ts:142](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L142)

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
