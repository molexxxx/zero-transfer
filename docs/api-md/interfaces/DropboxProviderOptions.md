[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DropboxProviderOptions

# Interface: DropboxProviderOptions

Defined in: [src/providers/cloud/DropboxProvider.ts:64](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L64)

Options accepted by [createDropboxProviderFactory](../functions/createDropboxProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the RPC base URL. Defaults to `https://api.dropboxapi.com`. | [src/providers/cloud/DropboxProvider.ts:68](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L68) |
| <a id="contentbaseurl"></a> `contentBaseUrl?` | `string` | Override the content base URL. Defaults to `https://content.dropboxapi.com`. | [src/providers/cloud/DropboxProvider.ts:70](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L70) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before bearer auth. | [src/providers/cloud/DropboxProvider.ts:74](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L74) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/DropboxProvider.ts:72](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L72) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"dropbox"`. | [src/providers/cloud/DropboxProvider.ts:66](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L66) |
| <a id="multipart"></a> `multipart?` | [`DropboxMultipartOptions`](DropboxMultipartOptions.md) | Upload-session tuning. Enabled by default. | [src/providers/cloud/DropboxProvider.ts:76](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L76) |
