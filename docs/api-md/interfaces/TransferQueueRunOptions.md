[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueRunOptions

# Interface: TransferQueueRunOptions

Defined in: [src/transfers/TransferQueue.ts:52](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L52)

Options used when draining a queue.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Bandwidth limit override for this drain. | [src/transfers/TransferQueue.ts:60](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L60) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer override for this drain. | [src/transfers/TransferQueue.ts:62](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L62) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy override for this drain. | [src/transfers/TransferQueue.ts:56](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L56) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel running jobs during this drain. | [src/transfers/TransferQueue.ts:54](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L54) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy override for this drain. | [src/transfers/TransferQueue.ts:58](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/transfers/TransferQueue.ts#L58) |
