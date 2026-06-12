[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueOptions

# Interface: TransferQueueOptions

Defined in: [src/transfers/TransferQueue.ts:29](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L29)

Options used to create a transfer queue.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape passed to transfer executors. | [src/transfers/TransferQueue.ts:48](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L48) |
| <a id="client"></a> `client?` | [`TransferClient`](../classes/TransferClient.md) | Transfer client whose [defaults](TransferClientDefaults.md) seed the queue's retry and timeout policies when not set here or per drain. | [src/transfers/TransferQueue.ts:36](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L36) |
| <a id="concurrency"></a> `concurrency?` | `number` | Maximum jobs to execute at the same time. Defaults to `1`. | [src/transfers/TransferQueue.ts:38](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L38) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Transfer engine used to execute queued jobs. Defaults to a new engine. | [src/transfers/TransferQueue.ts:31](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L31) |
| <a id="executor"></a> `executor?` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) | Default executor used for jobs that do not provide one directly. | [src/transfers/TransferQueue.ts:40](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L40) |
| <a id="onerror"></a> `onError?` | (`item`, `error`) => `void` | Failure observer for failed jobs. | [src/transfers/TransferQueue.ts:54](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L54) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer shared across queued jobs. | [src/transfers/TransferQueue.ts:50](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L50) |
| <a id="onreceipt"></a> `onReceipt?` | (`receipt`) => `void` | Completion observer for successful jobs. | [src/transfers/TransferQueue.ts:52](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L52) |
| <a id="resolveexecutor"></a> `resolveExecutor?` | [`TransferQueueExecutorResolver`](../type-aliases/TransferQueueExecutorResolver.md) | Dynamic executor resolver used when no per-job executor or default executor exists. | [src/transfers/TransferQueue.ts:42](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L42) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy passed to engine executions. Falls back to `client.defaults.retry`. | [src/transfers/TransferQueue.ts:44](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L44) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy passed to engine executions. Falls back to `client.defaults.timeout`. | [src/transfers/TransferQueue.ts:46](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferQueue.ts#L46) |
