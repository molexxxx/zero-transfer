[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / TransferQueueSummary

# Interface: TransferQueueSummary

Defined in: [src/transfers/TransferQueue.ts:85](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L85)

Summary returned after a queue drain.

## Properties

| Property                           | Type                                          | Description                                               | Defined in                                                                                                                                                          |
| ---------------------------------- | --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="canceled"></a> `canceled`   | `number`                                      | Number of canceled jobs.                                  | [src/transfers/TransferQueue.ts:93](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L93)   |
| <a id="completed"></a> `completed` | `number`                                      | Number of successfully completed jobs.                    | [src/transfers/TransferQueue.ts:89](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L89)   |
| <a id="failed"></a> `failed`       | `number`                                      | Number of failed jobs.                                    | [src/transfers/TransferQueue.ts:91](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L91)   |
| <a id="failures"></a> `failures`   | [`TransferQueueItem`](TransferQueueItem.md)[] | Failed queue items in queue order.                        | [src/transfers/TransferQueue.ts:101](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L101) |
| <a id="queued"></a> `queued`       | `number`                                      | Number of jobs still queued because the queue was paused. | [src/transfers/TransferQueue.ts:95](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L95)   |
| <a id="receipts"></a> `receipts`   | [`TransferReceipt`](TransferReceipt.md)[]     | Successful receipts in queue order.                       | [src/transfers/TransferQueue.ts:99](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L99)   |
| <a id="running"></a> `running`     | `number`                                      | Number of jobs currently running.                         | [src/transfers/TransferQueue.ts:97](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L97)   |
| <a id="total"></a> `total`         | `number`                                      | Number of items currently known to the queue.             | [src/transfers/TransferQueue.ts:87](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L87)   |
