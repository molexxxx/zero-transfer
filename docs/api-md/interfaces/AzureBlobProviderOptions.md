[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AzureBlobProviderOptions

# Interface: AzureBlobProviderOptions

Defined in: [src/providers/cloud/AzureBlobProvider.ts:54](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L54)

Options accepted by [createAzureBlobProviderFactory](../functions/createAzureBlobProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account"></a> `account?` | `string` | Storage account name; combined with `endpoint` when no full URL is supplied. | [src/providers/cloud/AzureBlobProvider.ts:58](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L58) |
| <a id="apiversion"></a> `apiVersion?` | `string` | Override the `x-ms-version` header. | [src/providers/cloud/AzureBlobProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L70) |
| <a id="container"></a> `container` | `string` | Container name. Required. | [src/providers/cloud/AzureBlobProvider.ts:60](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L60) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/AzureBlobProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L74) |
| <a id="endpoint"></a> `endpoint?` | `string` | Override the endpoint host. Defaults to `https://{account}.blob.core.windows.net`. Provide for sovereign clouds or Azurite (`http://127.0.0.1:10000/devstoreaccount1`). | [src/providers/cloud/AzureBlobProvider.ts:66](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L66) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/AzureBlobProvider.ts:72](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L72) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"azure-blob"`. | [src/providers/cloud/AzureBlobProvider.ts:56](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L56) |
| <a id="multipart"></a> `multipart?` | [`AzureBlobMultipartOptions`](AzureBlobMultipartOptions.md) | Multipart (staged-block) upload tuning. Enabled by default. | [src/providers/cloud/AzureBlobProvider.ts:76](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L76) |
| <a id="sastoken"></a> `sasToken?` | `string` | SAS token query string (without leading `?`). Mutually compatible with bearer auth. | [src/providers/cloud/AzureBlobProvider.ts:68](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L68) |
