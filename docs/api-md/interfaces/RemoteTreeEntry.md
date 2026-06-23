[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeEntry

# Interface: RemoteTreeEntry

Defined in: [src/sync/walkRemoteTree.ts:33](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/walkRemoteTree.ts#L33)

Walk record yielded by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="depth"></a> `depth` | `number` | Zero-based depth relative to the traversal root. | [src/sync/walkRemoteTree.ts:37](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/walkRemoteTree.ts#L37) |
| <a id="entry"></a> `entry` | [`RemoteEntry`](RemoteEntry.md) | Visited remote entry. | [src/sync/walkRemoteTree.ts:35](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/walkRemoteTree.ts#L35) |
| <a id="parentpath"></a> `parentPath` | `string` | Normalized parent directory path. | [src/sync/walkRemoteTree.ts:39](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/walkRemoteTree.ts#L39) |
