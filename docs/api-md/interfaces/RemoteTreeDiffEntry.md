[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemoteTreeDiffEntry

# Interface: RemoteTreeDiffEntry

Defined in: [src/sync/diffRemoteTrees.ts:22](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L22)

Single diff record produced by [diffRemoteTrees](../functions/diffRemoteTrees.md).

## Properties

| Property                                | Type                                                                | Description                                                                          | Defined in                                                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="destination"></a> `destination?` | [`RemoteEntry`](RemoteEntry.md)                                     | Destination-side entry, when present.                                                | [src/sync/diffRemoteTrees.ts:32](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L32) |
| <a id="path"></a> `path`                | `string`                                                            | Path relative to the traversal root, beginning with `/`.                             | [src/sync/diffRemoteTrees.ts:24](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L24) |
| <a id="reasons"></a> `reasons`          | [`RemoteTreeDiffReason`](../type-aliases/RemoteTreeDiffReason.md)[] | Reasons the entry is considered modified. Empty for unchanged/added/removed records. | [src/sync/diffRemoteTrees.ts:28](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L28) |
| <a id="source"></a> `source?`           | [`RemoteEntry`](RemoteEntry.md)                                     | Source-side entry, when present.                                                     | [src/sync/diffRemoteTrees.ts:30](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L30) |
| <a id="status"></a> `status`            | [`RemoteTreeDiffStatus`](../type-aliases/RemoteTreeDiffStatus.md)   | Outcome category for this entry.                                                     | [src/sync/diffRemoteTrees.ts:26](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/diffRemoteTrees.ts#L26) |
