[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / EvaluateRetentionOptions

# Interface: EvaluateRetentionOptions

Defined in: [src/mft/retention.ts:47](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/retention.ts#L47)

Options accepted by [evaluateRetention](../functions/evaluateRetention.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="entries"></a> `entries` | readonly [`RemoteEntry`](RemoteEntry.md)[] | Listing to evaluate. Directories and symlinks are passed through unchanged. | [src/mft/retention.ts:49](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/retention.ts#L49) |
| <a id="now"></a> `now?` | `Date` | Reference time used by age policies. Defaults to `new Date()`. | [src/mft/retention.ts:53](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/retention.ts#L53) |
| <a id="policy"></a> `policy` | [`RetentionPolicy`](../type-aliases/RetentionPolicy.md) | Policy to apply. | [src/mft/retention.ts:51](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/retention.ts#L51) |
