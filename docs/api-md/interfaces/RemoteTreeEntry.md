[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeEntry

# Interface: RemoteTreeEntry

Defined in: [src/sync/walkRemoteTree.ts:33](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/walkRemoteTree.ts#L33)

Walk record yielded by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="depth"></a> `depth` | `number` | Zero-based depth relative to the traversal root. | [src/sync/walkRemoteTree.ts:37](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/walkRemoteTree.ts#L37) |
| <a id="entry"></a> `entry` | [`RemoteEntry`](RemoteEntry.md) | Visited remote entry. | [src/sync/walkRemoteTree.ts:35](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/walkRemoteTree.ts#L35) |
| <a id="parentpath"></a> `parentPath` | `string` | Normalized parent directory path. | [src/sync/walkRemoteTree.ts:39](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/walkRemoteTree.ts#L39) |
