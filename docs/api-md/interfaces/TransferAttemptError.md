[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferAttemptError

# Interface: TransferAttemptError

Defined in: [src/transfers/TransferJob.ts:95](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L95)

Serializable error summary retained in failed attempts.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | Stable SDK error code when available. | [src/transfers/TransferJob.ts:101](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L101) |
| <a id="message"></a> `message` | `string` | Human-readable error message. | [src/transfers/TransferJob.ts:99](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L99) |
| <a id="name"></a> `name` | `string` | Error class or constructor name. | [src/transfers/TransferJob.ts:97](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L97) |
| <a id="retryable"></a> `retryable?` | `boolean` | Whether retry policy may retry the failure. | [src/transfers/TransferJob.ts:103](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L103) |
