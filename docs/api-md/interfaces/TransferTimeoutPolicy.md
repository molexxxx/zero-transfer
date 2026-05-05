[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferTimeoutPolicy

# Interface: TransferTimeoutPolicy

Defined in: [src/transfers/TransferJob.ts:53](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L53)

Timeout policy applied by the transfer engine.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="retryable"></a> `retryable?` | `boolean` | Whether timeout failures are retryable. Defaults to `true`. | [src/transfers/TransferJob.ts:57](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L57) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Maximum duration for the full engine execution, including retries, in milliseconds. | [src/transfers/TransferJob.ts:55](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferJob.ts#L55) |
