[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AzureBlobProviderOptions

# Interface: AzureBlobProviderOptions

Defined in: [src/providers/cloud/AzureBlobProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L55)

Options accepted by [createAzureBlobProviderFactory](../functions/createAzureBlobProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account"></a> `account?` | `string` | Storage account name; combined with `endpoint` when no full URL is supplied. | [src/providers/cloud/AzureBlobProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L59) |
| <a id="apiversion"></a> `apiVersion?` | `string` | Override the `x-ms-version` header. | [src/providers/cloud/AzureBlobProvider.ts:71](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L71) |
| <a id="container"></a> `container` | `string` | Container name. Required. | [src/providers/cloud/AzureBlobProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L61) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/AzureBlobProvider.ts:75](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L75) |
| <a id="endpoint"></a> `endpoint?` | `string` | Override the endpoint host. Defaults to `https://{account}.blob.core.windows.net`. Provide for sovereign clouds or Azurite (`http://127.0.0.1:10000/devstoreaccount1`). | [src/providers/cloud/AzureBlobProvider.ts:67](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L67) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/AzureBlobProvider.ts:73](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L73) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"azure-blob"`. | [src/providers/cloud/AzureBlobProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L57) |
| <a id="multipart"></a> `multipart?` | [`AzureBlobMultipartOptions`](AzureBlobMultipartOptions.md) | Multipart (staged-block) upload tuning. Enabled by default. | [src/providers/cloud/AzureBlobProvider.ts:77](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L77) |
| <a id="sastoken"></a> `sasToken?` | `string` | SAS token query string (without leading `?`). Mutually compatible with bearer auth. | [src/providers/cloud/AzureBlobProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/providers/cloud/AzureBlobProvider.ts#L69) |
