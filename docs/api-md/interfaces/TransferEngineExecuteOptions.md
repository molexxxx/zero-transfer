[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferEngineExecuteOptions

# Interface: TransferEngineExecuteOptions

Defined in: [src/transfers/TransferEngine.ts:67](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L67)

Options used by [TransferEngine.execute](../classes/TransferEngine.md#execute).

## Methods

### onProgress()?

```ts
optional onProgress(event): void;
```

Defined in: [src/transfers/TransferEngine.ts:73](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L73)

Progress observer for normalized transfer progress events.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`TransferProgressEvent`](TransferProgressEvent.md) |

#### Returns

`void`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape passed through to concrete executors. | [src/transfers/TransferEngine.ts:77](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L77) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy used for failed attempts. | [src/transfers/TransferEngine.ts:71](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L71) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the job. | [src/transfers/TransferEngine.ts:69](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L69) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy enforced by the engine. | [src/transfers/TransferEngine.ts:75](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/transfers/TransferEngine.ts#L75) |
