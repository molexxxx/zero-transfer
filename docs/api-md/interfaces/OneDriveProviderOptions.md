[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OneDriveProviderOptions

# Interface: OneDriveProviderOptions

Defined in: [src/providers/cloud/OneDriveProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/OneDriveProvider.ts#L53)

Options accepted by [createOneDriveProviderFactory](../functions/createOneDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/OneDriveProvider.ts:65](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/OneDriveProvider.ts#L65) |
| <a id="drivebaseurl"></a> `driveBaseUrl?` | `string` | Drive root URL used as the prefix for every Graph call. Defaults to `https://graph.microsoft.com/v1.0/me/drive`. Override with a SharePoint drive URL like `https://graph.microsoft.com/v1.0/drives/{driveId}`. | [src/providers/cloud/OneDriveProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/OneDriveProvider.ts#L61) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/OneDriveProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/OneDriveProvider.ts#L63) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"one-drive"`. | [src/providers/cloud/OneDriveProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/OneDriveProvider.ts#L55) |
