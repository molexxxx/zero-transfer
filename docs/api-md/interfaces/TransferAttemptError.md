[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferAttemptError

# Interface: TransferAttemptError

Defined in: [src/transfers/TransferJob.ts:95](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L95)

Serializable error summary retained in failed attempts.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code?` | `string` | Stable SDK error code when available. | [src/transfers/TransferJob.ts:101](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L101) |
| <a id="message"></a> `message` | `string` | Human-readable error message. | [src/transfers/TransferJob.ts:99](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L99) |
| <a id="name"></a> `name` | `string` | Error class or constructor name. | [src/transfers/TransferJob.ts:97](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L97) |
| <a id="retryable"></a> `retryable?` | `boolean` | Whether retry policy may retry the failure. | [src/transfers/TransferJob.ts:103](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L103) |
