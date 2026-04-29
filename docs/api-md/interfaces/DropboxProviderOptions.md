[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DropboxProviderOptions

# Interface: DropboxProviderOptions

Defined in: [src/providers/cloud/DropboxProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L53)

Options accepted by [createDropboxProviderFactory](../functions/createDropboxProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the RPC base URL. Defaults to `https://api.dropboxapi.com`. | [src/providers/cloud/DropboxProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L57) |
| <a id="contentbaseurl"></a> `contentBaseUrl?` | `string` | Override the content base URL. Defaults to `https://content.dropboxapi.com`. | [src/providers/cloud/DropboxProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L59) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before bearer auth. | [src/providers/cloud/DropboxProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L63) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/DropboxProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L61) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"dropbox"`. | [src/providers/cloud/DropboxProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/DropboxProvider.ts#L55) |
