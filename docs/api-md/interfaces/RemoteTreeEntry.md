[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeEntry

# Interface: RemoteTreeEntry

Defined in: [src/sync/walkRemoteTree.ts:33](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/walkRemoteTree.ts#L33)

Walk record yielded by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="depth"></a> `depth` | `number` | Zero-based depth relative to the traversal root. | [src/sync/walkRemoteTree.ts:37](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/walkRemoteTree.ts#L37) |
| <a id="entry"></a> `entry` | [`RemoteEntry`](RemoteEntry.md) | Visited remote entry. | [src/sync/walkRemoteTree.ts:35](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/walkRemoteTree.ts#L35) |
| <a id="parentpath"></a> `parentPath` | `string` | Normalized parent directory path. | [src/sync/walkRemoteTree.ts:39](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/walkRemoteTree.ts#L39) |
