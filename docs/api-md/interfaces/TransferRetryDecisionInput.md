[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferRetryDecisionInput

# Interface: TransferRetryDecisionInput

Defined in: [src/transfers/TransferEngine.ts:47](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L47)

Input used by retry policy hooks.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number that failed. | [src/transfers/TransferEngine.ts:51](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L51) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Milliseconds elapsed since the engine execution started, including prior attempts and delays. | [src/transfers/TransferEngine.ts:53](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L53) |
| <a id="error"></a> `error` | `unknown` | Error thrown by the failed attempt. | [src/transfers/TransferEngine.ts:49](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L49) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [src/transfers/TransferEngine.ts:55](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L55) |
