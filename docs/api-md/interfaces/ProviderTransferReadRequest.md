[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferReadRequest

# Interface: ProviderTransferReadRequest

Defined in: [src/providers/ProviderTransferOperations.ts:34](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/ProviderTransferOperations.ts#L34)

Request passed to provider read implementations.

## Extends

- [`ProviderTransferRequest`](ProviderTransferRequest.md)

## Methods

### reportProgress()

```ts
reportProgress(bytesTransferred, totalBytes?): TransferProgressEvent;
```

Defined in: [src/transfers/TransferEngine.ts:38](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L38)

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

Defined in: [src/transfers/TransferEngine.ts:36](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L36)

Throws an SDK abort error when the active signal has been cancelled.

#### Returns

`void`

#### Inherited from

[`ProviderTransferRequest`](ProviderTransferRequest.md).[`throwIfAborted`](ProviderTransferRequest.md#throwifaborted)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`attempt`](ProviderTransferRequest.md#attempt) | [src/transfers/TransferEngine.ts:30](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L30) |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape for concrete executors to honor. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`bandwidthLimit`](ProviderTransferRequest.md#bandwidthlimit) | [src/transfers/TransferEngine.ts:34](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L34) |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint owned by the provider handling this request. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`endpoint`](ProviderTransferRequest.md#endpoint) | [src/providers/ProviderTransferOperations.ts:30](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/ProviderTransferOperations.ts#L30) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`job`](ProviderTransferRequest.md#job) | [src/transfers/TransferEngine.ts:28](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L28) |
| <a id="range"></a> `range?` | [`TransferByteRange`](TransferByteRange.md) | Optional byte range for resumed or partial reads. | - | [src/providers/ProviderTransferOperations.ts:36](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/ProviderTransferOperations.ts#L36) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal active for this execution when supplied. | [`ProviderTransferRequest`](ProviderTransferRequest.md).[`signal`](ProviderTransferRequest.md#signal) | [src/transfers/TransferEngine.ts:32](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L32) |
