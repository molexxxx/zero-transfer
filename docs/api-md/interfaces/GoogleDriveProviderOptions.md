[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GoogleDriveProviderOptions

# Interface: GoogleDriveProviderOptions

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:65](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L65)

Options accepted by [createGoogleDriveProviderFactory](../functions/createGoogleDriveProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the API base URL. Defaults to `https://www.googleapis.com/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L69) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before bearer auth. | [src/providers/cloud/GoogleDriveProvider.ts:81](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L81) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GoogleDriveProvider.ts:79](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L79) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"google-drive"`. | [src/providers/cloud/GoogleDriveProvider.ts:67](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L67) |
| <a id="multipart"></a> `multipart?` | [`GoogleDriveMultipartOptions`](GoogleDriveMultipartOptions.md) | Resumable-session upload tuning. Enabled by default. | [src/providers/cloud/GoogleDriveProvider.ts:83](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L83) |
| <a id="rootfolderid"></a> `rootFolderId?` | `string` | Folder id used as the root for path resolution. Defaults to `"root"` (the authenticated user's My Drive root). Pass a folder id when the SDK should scope to a shared drive subtree. | [src/providers/cloud/GoogleDriveProvider.ts:77](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L77) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload base URL. Defaults to `https://www.googleapis.com/upload/drive/v3`. | [src/providers/cloud/GoogleDriveProvider.ts:71](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/GoogleDriveProvider.ts#L71) |
