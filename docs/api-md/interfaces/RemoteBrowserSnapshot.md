[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteBrowserSnapshot

# Interface: RemoteBrowserSnapshot

Defined in: [src/sync/createRemoteBrowser.ts:48](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createRemoteBrowser.ts#L48)

Snapshot returned by browser navigation methods.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="breadcrumbs"></a> `breadcrumbs` | [`RemoteBreadcrumb`](RemoteBreadcrumb.md)[] | Breadcrumb trail leading from `/` to [path](#path). | [src/sync/createRemoteBrowser.ts:54](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createRemoteBrowser.ts#L54) |
| <a id="entries"></a> `entries` | [`RemoteEntry`](RemoteEntry.md)[] | Directory entries after sorting and filtering. | [src/sync/createRemoteBrowser.ts:52](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createRemoteBrowser.ts#L52) |
| <a id="path"></a> `path` | `string` | Current absolute path. | [src/sync/createRemoteBrowser.ts:50](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createRemoteBrowser.ts#L50) |
