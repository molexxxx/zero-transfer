[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueOptions

# Interface: TransferQueueOptions

Defined in: [src/transfers/TransferQueue.ts:28](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L28)

Options used to create a transfer queue.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape passed to transfer executors. | [src/transfers/TransferQueue.ts:42](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L42) |
| <a id="concurrency"></a> `concurrency?` | `number` | Maximum jobs to execute at the same time. Defaults to `1`. | [src/transfers/TransferQueue.ts:32](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L32) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Transfer engine used to execute queued jobs. Defaults to a new engine. | [src/transfers/TransferQueue.ts:30](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L30) |
| <a id="executor"></a> `executor?` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) | Default executor used for jobs that do not provide one directly. | [src/transfers/TransferQueue.ts:34](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L34) |
| <a id="onerror"></a> `onError?` | (`item`, `error`) => `void` | Failure observer for failed jobs. | [src/transfers/TransferQueue.ts:48](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L48) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer shared across queued jobs. | [src/transfers/TransferQueue.ts:44](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L44) |
| <a id="onreceipt"></a> `onReceipt?` | (`receipt`) => `void` | Completion observer for successful jobs. | [src/transfers/TransferQueue.ts:46](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L46) |
| <a id="resolveexecutor"></a> `resolveExecutor?` | [`TransferQueueExecutorResolver`](../type-aliases/TransferQueueExecutorResolver.md) | Dynamic executor resolver used when no per-job executor or default executor exists. | [src/transfers/TransferQueue.ts:36](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L36) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy passed to engine executions. | [src/transfers/TransferQueue.ts:38](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L38) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy passed to engine executions. | [src/transfers/TransferQueue.ts:40](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferQueue.ts#L40) |
