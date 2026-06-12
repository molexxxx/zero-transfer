[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResumableBatchOptions

# Interface: ResumableBatchOptions

Defined in: src/transfers/resumableBatch.ts:236

Options accepted by [runResumableBatch](../functions/runResumableBatch.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Bandwidth limit forwarded to the queue. | src/transfers/resumableBatch.ts:258 |
| <a id="batchstore"></a> `batchStore` | [`TransferBatchStateStore`](TransferBatchStateStore.md) | Step-completion persistence. | src/transfers/resumableBatch.ts:246 |
| <a id="client"></a> `client?` | [`TransferClient`](../classes/TransferClient.md) | Client whose defaults seed queue retry/timeout policies. | src/transfers/resumableBatch.ts:250 |
| <a id="concurrency"></a> `concurrency?` | `number` | Maximum steps executed concurrently. Defaults to `1`. | src/transfers/resumableBatch.ts:252 |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Transfer engine override forwarded to the queue. | src/transfers/resumableBatch.ts:248 |
| <a id="executor"></a> `executor` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) | Executor for individual jobs. Pass an executor created with [createProviderTransferExecutor](../functions/createProviderTransferExecutor.md) and a `resume` option so interrupted files also resume at the byte level. | src/transfers/resumableBatch.ts:244 |
| <a id="onerror"></a> `onError?` | (`item`, `error`) => `void` | Failure observer per failed step. | src/transfers/resumableBatch.ts:266 |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer shared across the batch. | src/transfers/resumableBatch.ts:262 |
| <a id="onreceipt"></a> `onReceipt?` | (`receipt`) => `void` | Completion observer per successful step. | src/transfers/resumableBatch.ts:264 |
| <a id="plan"></a> `plan` | [`TransferPlan`](TransferPlan.md) | Plan to execute (or re-execute after a crash). | src/transfers/resumableBatch.ts:238 |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy forwarded to the queue. | src/transfers/resumableBatch.ts:254 |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal canceling the batch run. | src/transfers/resumableBatch.ts:260 |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy forwarded to the queue. | src/transfers/resumableBatch.ts:256 |
