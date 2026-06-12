[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferWriteRequest

# Interface: ProviderTransferWriteRequest

Defined in: [src/providers/ProviderTransferOperations.ts:60](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L60)

Request passed to provider write implementations.

## Extends

- [`ProviderTransferRequest`](ProviderTransferRequest.md)

## Methods

### reportProgress()

```ts
reportProgress(bytesTransferred, totalBytes?): TransferProgressEvent;
```

Defined in: [src/transfers/TransferEngine.ts:38](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L38)

Emits a normalized progress event through engine options.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bytesTransferred` | `number` |
| `totalBytes?` | `number` |

#### Returns

[`TransferProgressEvent`](TransferProgressEvent.md)

#### Inherited from

[`ProviderTransferRequest`](ProviderTransferRequest.md).[`reportProgress`](ProviderTransferRequest.md#reportprogress)

***

### throwIfAborted()

```ts
throwIfAborted(): void;
```

Defined in: [src/transfers/TransferEngine.ts:36](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L36)

Throws an SDK abort error when the active signal has been cancelled.

#### Returns

`void`

#### Inherited from

[`ProviderTransferRequest`](ProviderTransferRequest.md).[`throwIfAborted`](ProviderTransferRequest.md#throwifaborted)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`attempt`](ProviderTransferRequest.md#attempt) | [src/transfers/TransferEngine.ts:30](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L30) |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape for concrete executors to honor. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`bandwidthLimit`](ProviderTransferRequest.md#bandwidthlimit) | [src/transfers/TransferEngine.ts:34](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L34) |
| <a id="checkpoint"></a> `checkpoint?` | [`TransferCheckpointHandle`](TransferCheckpointHandle.md) | Checkpoint handle for part-aware providers (multipart/staged-block uploads). Attached by the transfer executor when resume is configured; providers persist progress through it and read prior state from it. | - | [src/providers/ProviderTransferOperations.ts:74](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L74) |
| <a id="content"></a> `content` | [`TransferDataSource`](../type-aliases/TransferDataSource.md) | Content stream to write to the provider endpoint. | - | [src/providers/ProviderTransferOperations.ts:62](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L62) |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint owned by the provider handling this request. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`endpoint`](ProviderTransferRequest.md#endpoint) | [src/providers/ProviderTransferOperations.ts:34](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L34) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`job`](ProviderTransferRequest.md#job) | [src/transfers/TransferEngine.ts:28](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L28) |
| <a id="offset"></a> `offset?` | `number` | Resume offset for partial writes when supported by the provider. | - | [src/providers/ProviderTransferOperations.ts:66](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L66) |
| <a id="onbytescommitted"></a> `onBytesCommitted?` | (`committedBytes`) => `void` | Reports the absolute contiguous byte watermark durably acknowledged by the destination (including any resume offset). Sequential-append providers call this after each acknowledged write so the executor can persist byte-offset checkpoints; unlike [reportProgress](TransferExecutionContext.md#reportprogress) the value must never include unacknowledged in-flight bytes. | - | [src/providers/ProviderTransferOperations.ts:82](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L82) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal active for this execution when supplied. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`signal`](ProviderTransferRequest.md#signal) | [src/transfers/TransferEngine.ts:32](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferEngine.ts#L32) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Expected total bytes for the content stream when known. | - | [src/providers/ProviderTransferOperations.ts:64](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L64) |
| <a id="verification"></a> `verification?` | [`TransferVerificationResult`](TransferVerificationResult.md) | Verification details from the read side that a writer may preserve or compare. | - | [src/providers/ProviderTransferOperations.ts:68](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/ProviderTransferOperations.ts#L68) |
