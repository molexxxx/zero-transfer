[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeEntry

# Interface: RemoteTreeEntry

Defined in: [src/sync/walkRemoteTree.ts:33](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/walkRemoteTree.ts#L33)

Walk record yielded by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="depth"></a> `depth` | `number` | Zero-based depth relative to the traversal root. | [src/sync/walkRemoteTree.ts:37](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/walkRemoteTree.ts#L37) |
| <a id="entry"></a> `entry` | [`RemoteEntry`](RemoteEntry.md) | Visited remote entry. | [src/sync/walkRemoteTree.ts:35](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/walkRemoteTree.ts#L35) |
| <a id="parentpath"></a> `parentPath` | `string` | Normalized parent directory path. | [src/sync/walkRemoteTree.ts:39](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/walkRemoteTree.ts#L39) |
