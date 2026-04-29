[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GoogleDriveProviderOptions

# Interface: GoogleDriveProviderOptions

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:58](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L58)

Options accepted by [createGoogleDriveProviderFactory](../functions/createGoogleDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the API base URL. Defaults to `https://www.googleapis.com/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:62](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L62) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before bearer auth. | [src/providers/cloud/GoogleDriveProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L74) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GoogleDriveProvider.ts:72](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L72) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"google-drive"`. | [src/providers/cloud/GoogleDriveProvider.ts:60](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L60) |
| <a id="rootfolderid"></a> `rootFolderId?` | `string` | Folder id used as the root for path resolution. Defaults to `"root"` (the authenticated user's My Drive root). Pass a folder id when the SDK should scope to a shared drive subtree. | [src/providers/cloud/GoogleDriveProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L70) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload base URL. Defaults to `https://www.googleapis.com/upload/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:64](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/cloud/GoogleDriveProvider.ts#L64) |
