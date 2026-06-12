[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueRunOptions

# Interface: TransferQueueRunOptions

Defined in: [src/transfers/TransferQueue.ts:58](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L58)

Options used when draining a queue.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Bandwidth limit override for this drain. | [src/transfers/TransferQueue.ts:66](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L66) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer override for this drain. | [src/transfers/TransferQueue.ts:68](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L68) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy override for this drain. | [src/transfers/TransferQueue.ts:62](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L62) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel running jobs during this drain. | [src/transfers/TransferQueue.ts:60](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L60) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy override for this drain. | [src/transfers/TransferQueue.ts:64](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L64) |
