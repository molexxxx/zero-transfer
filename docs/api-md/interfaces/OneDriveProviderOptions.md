[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OneDriveProviderOptions

# Interface: OneDriveProviderOptions

Defined in: [src/providers/cloud/OneDriveProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L57)

Options accepted by [createOneDriveProviderFactory](../functions/createOneDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/OneDriveProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L69) |
| <a id="drivebaseurl"></a> `driveBaseUrl?` | `string` | Drive root URL used as the prefix for every Graph call. Defaults to `https://graph.microsoft.com/v1.0/me/drive`. Override with a SharePoint drive URL like `https://graph.microsoft.com/v1.0/drives/{driveId}`. | [src/providers/cloud/OneDriveProvider.ts:65](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L65) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/OneDriveProvider.ts:67](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L67) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"one-drive"`. | [src/providers/cloud/OneDriveProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L59) |
| <a id="multipart"></a> `multipart?` | [`OneDriveMultipartOptions`](OneDriveMultipartOptions.md) | Resumable upload session tuning. Enabled by default. | [src/providers/cloud/OneDriveProvider.ts:71](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/OneDriveProvider.ts#L71) |
