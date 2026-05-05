[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferRetryDecisionInput

# Interface: TransferRetryDecisionInput

Defined in: [src/transfers/TransferEngine.ts:47](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/TransferEngine.ts#L47)

Input used by retry policy hooks.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number that failed. | [src/transfers/TransferEngine.ts:51](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/TransferEngine.ts#L51) |
| <a id="error"></a> `error` | `unknown` | Error thrown by the failed attempt. | [src/transfers/TransferEngine.ts:49](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/TransferEngine.ts#L49) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [src/transfers/TransferEngine.ts:53](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/TransferEngine.ts#L53) |
