[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueItem

# Interface: TransferQueueItem

Defined in: [src/transfers/TransferQueue.ts:72](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L72)

Enqueued transfer job state.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | `unknown` | Failure or cancellation reason when available. | [src/transfers/TransferQueue.ts:82](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L82) |
| <a id="id"></a> `id` | `string` | Queued job identifier. | [src/transfers/TransferQueue.ts:74](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L74) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Original transfer job. | [src/transfers/TransferQueue.ts:76](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L76) |
| <a id="receipt"></a> `receipt?` | [`TransferReceipt`](TransferReceipt.md) | Successful transfer receipt when completed. | [src/transfers/TransferQueue.ts:80](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L80) |
| <a id="status"></a> `status` | [`TransferQueueItemStatus`](../type-aliases/TransferQueueItemStatus.md) | Current queue status. | [src/transfers/TransferQueue.ts:78](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferQueue.ts#L78) |
