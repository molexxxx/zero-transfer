[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferAttempt

# Interface: TransferAttempt

Defined in: [src/transfers/TransferJob.ts:107](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L107)

Execution attempt retained in a transfer receipt.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [src/transfers/TransferJob.ts:109](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L109) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes reported by the attempt before completion or failure. | [src/transfers/TransferJob.ts:117](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L117) |
| <a id="completedat"></a> `completedAt` | `Date` | Time this attempt finished or failed. | [src/transfers/TransferJob.ts:113](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L113) |
| <a id="durationms"></a> `durationMs` | `number` | Attempt duration in milliseconds. | [src/transfers/TransferJob.ts:115](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L115) |
| <a id="error"></a> `error?` | [`TransferAttemptError`](TransferAttemptError.md) | Error summary for failed attempts. | [src/transfers/TransferJob.ts:119](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L119) |
| <a id="startedat"></a> `startedAt` | `Date` | Time this attempt began. | [src/transfers/TransferJob.ts:111](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L111) |
