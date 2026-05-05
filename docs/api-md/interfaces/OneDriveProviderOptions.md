[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OneDriveProviderOptions

# Interface: OneDriveProviderOptions

Defined in: [src/providers/cloud/OneDriveProvider.ts:56](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L56)

Options accepted by [createOneDriveProviderFactory](../functions/createOneDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/OneDriveProvider.ts:68](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L68) |
| <a id="drivebaseurl"></a> `driveBaseUrl?` | `string` | Drive root URL used as the prefix for every Graph call. Defaults to `https://graph.microsoft.com/v1.0/me/drive`. Override with a SharePoint drive URL like `https://graph.microsoft.com/v1.0/drives/{driveId}`. | [src/providers/cloud/OneDriveProvider.ts:64](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L64) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/OneDriveProvider.ts:66](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L66) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"one-drive"`. | [src/providers/cloud/OneDriveProvider.ts:58](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L58) |
| <a id="multipart"></a> `multipart?` | [`OneDriveMultipartOptions`](OneDriveMultipartOptions.md) | Resumable upload session tuning. Enabled by default. | [src/providers/cloud/OneDriveProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L70) |
