[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RetentionEvaluation

# Interface: RetentionEvaluation

Defined in: [src/mft/retention.ts:39](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/retention.ts#L39)

Result returned by [evaluateRetention](../functions/evaluateRetention.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="evict"></a> `evict` | [`RemoteEntry`](RemoteEntry.md)[] | Entries selected for eviction. | [src/mft/retention.ts:43](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/retention.ts#L43) |
| <a id="keep"></a> `keep` | [`RemoteEntry`](RemoteEntry.md)[] | Entries that should be retained. | [src/mft/retention.ts:41](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/retention.ts#L41) |
