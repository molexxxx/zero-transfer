[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemoteTreeDiff

# Interface: RemoteTreeDiff

Defined in: [src/sync/diffRemoteTrees.ts:50](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L50)

Result returned by [diffRemoteTrees](../functions/diffRemoteTrees.md).

## Properties

| Property                       | Type                                                | Description                  | Defined in                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="entries"></a> `entries` | [`RemoteTreeDiffEntry`](RemoteTreeDiffEntry.md)[]   | Diff records sorted by path. | [src/sync/diffRemoteTrees.ts:52](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L52) |
| <a id="summary"></a> `summary` | [`RemoteTreeDiffSummary`](RemoteTreeDiffSummary.md) | Compact counts for the diff. | [src/sync/diffRemoteTrees.ts:54](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L54) |
