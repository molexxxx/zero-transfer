[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferExecutionContext

# Interface: TransferExecutionContext

Defined in: [src/transfers/TransferEngine.ts:26](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L26)

Context passed to a concrete transfer operation.

## Extended by

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

***

### throwIfAborted()

```ts
throwIfAborted(): void;
```

Defined in: [src/transfers/TransferEngine.ts:36](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L36)

Throws an SDK abort error when the active signal has been cancelled.

#### Returns

`void`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempt"></a> `attempt` | `number` | One-based attempt number. | [src/transfers/TransferEngine.ts:30](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L30) |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape for concrete executors to honor. | [src/transfers/TransferEngine.ts:34](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L34) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job being executed. | [src/transfers/TransferEngine.ts:28](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L28) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal active for this execution when supplied. | [src/transfers/TransferEngine.ts:32](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferEngine.ts#L32) |
