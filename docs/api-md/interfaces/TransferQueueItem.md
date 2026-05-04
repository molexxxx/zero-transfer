[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueItem

# Interface: TransferQueueItem

Defined in: [src/transfers/TransferQueue.ts:66](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L66)

Enqueued transfer job state.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | `unknown` | Failure or cancellation reason when available. | [src/transfers/TransferQueue.ts:76](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L76) |
| <a id="id"></a> `id` | `string` | Queued job identifier. | [src/transfers/TransferQueue.ts:68](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L68) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Original transfer job. | [src/transfers/TransferQueue.ts:70](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L70) |
| <a id="receipt"></a> `receipt?` | [`TransferReceipt`](TransferReceipt.md) | Successful transfer receipt when completed. | [src/transfers/TransferQueue.ts:74](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L74) |
| <a id="status"></a> `status` | [`TransferQueueItemStatus`](../type-aliases/TransferQueueItemStatus.md) | Current queue status. | [src/transfers/TransferQueue.ts:72](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferQueue.ts#L72) |
