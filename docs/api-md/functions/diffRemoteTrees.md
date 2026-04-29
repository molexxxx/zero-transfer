[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / diffRemoteTrees

# Function: diffRemoteTrees()

```ts
function diffRemoteTrees(
   source, 
   sourcePath, 
   destination, 
   destinationPath, 
options?): Promise<RemoteTreeDiff>;
```

Defined in: [src/sync/diffRemoteTrees.ts:96](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/diffRemoteTrees.ts#L96)

Compares two remote subtrees and produces an entry-level diff.

Source and destination paths are walked independently; entries are then aligned by
the relative path from each tree root. Directory equality is structural — directories
are equal when their relative paths match and the entry types agree.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md) | Source-side remote file system. |
| `sourcePath` | `string` | Source-side root path being compared. |
| `destination` | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md) | Destination-side remote file system. |
| `destinationPath` | `string` | Destination-side root path being compared. |
| `options` | [`DiffRemoteTreesOptions`](../interfaces/DiffRemoteTreesOptions.md) | Optional comparison controls. |

## Returns

`Promise`\<[`RemoteTreeDiff`](../interfaces/RemoteTreeDiff.md)\>

Diff result containing entries and a summary.
