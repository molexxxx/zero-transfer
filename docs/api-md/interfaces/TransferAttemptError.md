[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferAttemptError

# Interface: TransferAttemptError

Defined in: [src/transfers/TransferJob.ts:127](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L127)

Serializable error summary retained in failed attempts.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | Stable SDK error code when available. | [src/transfers/TransferJob.ts:133](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L133) |
| <a id="message"></a> `message` | `string` | Human-readable error message. | [src/transfers/TransferJob.ts:131](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L131) |
| <a id="name"></a> `name` | `string` | Error class or constructor name. | [src/transfers/TransferJob.ts:129](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L129) |
| <a id="retryable"></a> `retryable?` | `boolean` | Whether retry policy may retry the failure. | [src/transfers/TransferJob.ts:135](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L135) |
