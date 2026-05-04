[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GoogleDriveProviderOptions

# Interface: GoogleDriveProviderOptions

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L59)

Options accepted by [createGoogleDriveProviderFactory](../functions/createGoogleDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the API base URL. Defaults to `https://www.googleapis.com/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L63) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before bearer auth. | [src/providers/cloud/GoogleDriveProvider.ts:75](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L75) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GoogleDriveProvider.ts:73](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L73) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"google-drive"`. | [src/providers/cloud/GoogleDriveProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L61) |
| <a id="rootfolderid"></a> `rootFolderId?` | `string` | Folder id used as the root for path resolution. Defaults to `"root"` (the authenticated user's My Drive root). Pass a folder id when the SDK should scope to a shared drive subtree. | [src/providers/cloud/GoogleDriveProvider.ts:71](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L71) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload base URL. Defaults to `https://www.googleapis.com/upload/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:65](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/cloud/GoogleDriveProvider.ts#L65) |
