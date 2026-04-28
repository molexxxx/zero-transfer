[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RemoteTreeDiff

# Interface: RemoteTreeDiff

Defined in: [src/sync/diffRemoteTrees.ts:50](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/diffRemoteTrees.ts#L50)

Result returned by [diffRemoteTrees](../functions/diffRemoteTrees.md).

## Properties

| Property                       | Type                                                | Description                  | Defined in                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="entries"></a> `entries` | [`RemoteTreeDiffEntry`](RemoteTreeDiffEntry.md)[]   | Diff records sorted by path. | [src/sync/diffRemoteTrees.ts:52](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/diffRemoteTrees.ts#L52) |
| <a id="summary"></a> `summary` | [`RemoteTreeDiffSummary`](RemoteTreeDiffSummary.md) | Compact counts for the diff. | [src/sync/diffRemoteTrees.ts:54](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/diffRemoteTrees.ts#L54) |
