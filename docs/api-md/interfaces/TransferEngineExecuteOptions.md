[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferEngineExecuteOptions

# Interface: TransferEngineExecuteOptions

Defined in: [src/transfers/TransferEngine.ts:83](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L83)

Options used by [TransferEngine.execute](../classes/TransferEngine.md#execute).

## Methods

### onProgress()?

```ts
optional onProgress(event): void;
```

Defined in: [src/transfers/TransferEngine.ts:89](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L89)

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
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional throughput limit shape passed through to concrete executors. | [src/transfers/TransferEngine.ts:93](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L93) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy used for failed attempts. | [src/transfers/TransferEngine.ts:87](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L87) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the job. | [src/transfers/TransferEngine.ts:85](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L85) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy enforced by the engine. | [src/transfers/TransferEngine.ts:91](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferEngine.ts#L91) |
