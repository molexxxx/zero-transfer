[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeDiff

# Interface: RemoteTreeDiff

Defined in: [src/sync/diffRemoteTrees.ts:50](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/sync/diffRemoteTrees.ts#L50)

Result returned by [diffRemoteTrees](../functions/diffRemoteTrees.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="entries"></a> `entries` | [`RemoteTreeDiffEntry`](RemoteTreeDiffEntry.md)[] | Diff records sorted by path. | [src/sync/diffRemoteTrees.ts:52](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/sync/diffRemoteTrees.ts#L52) |
| <a id="summary"></a> `summary` | [`RemoteTreeDiffSummary`](RemoteTreeDiffSummary.md) | Compact counts for the diff. | [src/sync/diffRemoteTrees.ts:54](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/sync/diffRemoteTrees.ts#L54) |
