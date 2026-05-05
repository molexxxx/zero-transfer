[**ZeroTransfer SDK v0.4.5**](../README.md)

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

Defined in: [src/sync/diffRemoteTrees.ts:116](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/diffRemoteTrees.ts#L116)

Compares two remote subtrees and produces an entry-level diff.

Source and destination paths are walked independently; entries are then aligned by
the relative path from each tree root. Directory equality is structural - directories
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

## Example

```ts
import { createSyncPlan, diffRemoteTrees } from "@zero-transfer/sdk";

const diff = await diffRemoteTrees(
  srcSession.fs, "/exports",
  dstSession.fs, "/exports",
  { compareUniqueId: true },
);

console.log(diff.summary); // { added, removed, changed, unchanged }

const plan = createSyncPlan({
  id: "exports-sync",
  diff,
  source: { provider: "sftp", rootPath: "/exports" },
  destination: { provider: "sftp", rootPath: "/exports" },
});
```
