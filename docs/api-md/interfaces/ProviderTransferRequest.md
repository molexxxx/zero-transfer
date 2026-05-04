[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferRequest

# Interface: ProviderTransferRequest

Defined in: [src/providers/ProviderTransferOperations.ts:28](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/ProviderTransferOperations.ts#L28)

Shared provider transfer request fields.

## Extends

- [`TransferExecutionContext`](TransferExecutionContext.md)

## Extended by

- [`ProviderTransferReadRequest`](ProviderTransferReadRequest.md)
- [`ProviderTransferWriteRequest`](ProviderTransferWriteRequest.md)

## Methods

### reportProgress()

```ts
reportProgress(bytesTransferred, totalBytes?): TransferProgressEvent;
```

Defined in: [src/transfers/TransferEngine.ts:38](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L38)

Emits a normalized progress event through engine options.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bytesTransferred` | `number` |
| `totalBytes?` | `number` |

#### Returns

[`TransferProgressEvent`](TransferProgressEvent.md)

#### Inherited from

[`TransferExecutionContext`](TransferExecutionContext.md).[`reportProgress`](TransferExecutionContext.md#reportprogress)

***

### throwIfAborted()

```ts
throwIfAborted(): void;
```

Defined in: [src/transfers/TransferEngine.ts:36](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L36)

Throws an SDK abort error when the active signal has been cancelled.

#### Returns

`void`

#### Inherited from

[`TransferExecutionContext`](TransferExecutionContext.md).[`throwIfAborted`](TransferExecutionContext.md#throwifaborted)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [`TransferExecutionContext`](TransferExecutionContext.md).[`attempt`](TransferExecutionContext.md#attempt) | [src/transfers/TransferEngine.ts:30](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L30) |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape for concrete executors to honor. | [`TransferExecutionContext`](TransferExecutionContext.md).[`bandwidthLimit`](TransferExecutionContext.md#bandwidthlimit) | [src/transfers/TransferEngine.ts:34](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L34) |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint owned by the provider handling this request. | - | [src/providers/ProviderTransferOperations.ts:30](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/ProviderTransferOperations.ts#L30) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [`TransferExecutionContext`](TransferExecutionContext.md).[`job`](TransferExecutionContext.md#job) | [src/transfers/TransferEngine.ts:28](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L28) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal active for this execution when supplied. | [`TransferExecutionContext`](TransferExecutionContext.md).[`signal`](TransferExecutionContext.md#signal) | [src/transfers/TransferEngine.ts:32](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L32) |
