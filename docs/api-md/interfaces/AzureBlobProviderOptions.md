[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AzureBlobProviderOptions

# Interface: AzureBlobProviderOptions

Defined in: [src/providers/cloud/AzureBlobProvider.ts:50](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L50)

Options accepted by [createAzureBlobProviderFactory](../functions/createAzureBlobProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account"></a> `account?` | `string` | Storage account name; combined with `endpoint` when no full URL is supplied. | [src/providers/cloud/AzureBlobProvider.ts:54](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L54) |
| <a id="apiversion"></a> `apiVersion?` | `string` | Override the `x-ms-version` header. | [src/providers/cloud/AzureBlobProvider.ts:66](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L66) |
| <a id="container"></a> `container` | `string` | Container name. Required. | [src/providers/cloud/AzureBlobProvider.ts:56](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L56) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/AzureBlobProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L70) |
| <a id="endpoint"></a> `endpoint?` | `string` | Override the endpoint host. Defaults to `https://{account}.blob.core.windows.net`. Provide for sovereign clouds or Azurite (`http://127.0.0.1:10000/devstoreaccount1`). | [src/providers/cloud/AzureBlobProvider.ts:62](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L62) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/AzureBlobProvider.ts:68](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L68) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"azure-blob"`. | [src/providers/cloud/AzureBlobProvider.ts:52](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L52) |
| <a id="sastoken"></a> `sasToken?` | `string` | SAS token query string (without leading `?`). Mutually compatible with bearer auth. | [src/providers/cloud/AzureBlobProvider.ts:64](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/AzureBlobProvider.ts#L64) |
