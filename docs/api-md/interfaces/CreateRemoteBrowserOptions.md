[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateRemoteBrowserOptions

# Interface: CreateRemoteBrowserOptions

Defined in: [src/sync/createRemoteBrowser.ts:32](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L32)

Options accepted by [createRemoteBrowser](../functions/createRemoteBrowser.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="filter"></a> `filter?` | [`RemoteBrowserFilter`](../type-aliases/RemoteBrowserFilter.md) | Optional filter applied after sort/hidden filtering. | [src/sync/createRemoteBrowser.ts:44](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L44) |
| <a id="fs"></a> `fs` | [`RemoteFileSystem`](RemoteFileSystem.md) | Remote file system to browse. | [src/sync/createRemoteBrowser.ts:34](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L34) |
| <a id="initialpath"></a> `initialPath?` | `string` | Initial path. Defaults to `"/"`. | [src/sync/createRemoteBrowser.ts:36](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L36) |
| <a id="showhidden"></a> `showHidden?` | `boolean` | Whether dotfile entries (names starting with `.`) are included. Defaults to `true`. | [src/sync/createRemoteBrowser.ts:42](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L42) |
| <a id="sortkey"></a> `sortKey?` | [`RemoteEntrySortKey`](../type-aliases/RemoteEntrySortKey.md) | Sort key applied to listings. Defaults to `"name"`. | [src/sync/createRemoteBrowser.ts:38](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L38) |
| <a id="sortorder"></a> `sortOrder?` | [`RemoteEntrySortOrder`](../type-aliases/RemoteEntrySortOrder.md) | Sort order applied to listings. Defaults to `"asc"`. | [src/sync/createRemoteBrowser.ts:40](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createRemoteBrowser.ts#L40) |
