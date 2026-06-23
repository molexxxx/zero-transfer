[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RetentionEvaluation

# Interface: RetentionEvaluation

Defined in: [src/mft/retention.ts:39](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/retention.ts#L39)

Result returned by [evaluateRetention](../functions/evaluateRetention.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="evict"></a> `evict` | [`RemoteEntry`](RemoteEntry.md)[] | Entries selected for eviction. | [src/mft/retention.ts:43](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/retention.ts#L43) |
| <a id="keep"></a> `keep` | [`RemoteEntry`](RemoteEntry.md)[] | Entries that should be retained. | [src/mft/retention.ts:41](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/retention.ts#L41) |
