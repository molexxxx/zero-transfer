[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferAttempt

# Interface: TransferAttempt

Defined in: [src/transfers/TransferJob.ts:139](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L139)

Execution attempt retained in a transfer receipt.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [src/transfers/TransferJob.ts:141](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L141) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes reported by the attempt before completion or failure. | [src/transfers/TransferJob.ts:149](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L149) |
| <a id="completedat"></a> `completedAt` | `Date` | Time this attempt finished or failed. | [src/transfers/TransferJob.ts:145](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L145) |
| <a id="durationms"></a> `durationMs` | `number` | Attempt duration in milliseconds. | [src/transfers/TransferJob.ts:147](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L147) |
| <a id="error"></a> `error?` | [`TransferAttemptError`](TransferAttemptError.md) | Error summary for failed attempts. | [src/transfers/TransferJob.ts:151](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L151) |
| <a id="startedat"></a> `startedAt` | `Date` | Time this attempt began. | [src/transfers/TransferJob.ts:143](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L143) |
