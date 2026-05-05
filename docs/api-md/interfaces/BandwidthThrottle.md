[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthThrottle

# Interface: BandwidthThrottle

Defined in: [src/transfers/BandwidthThrottle.ts:21](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/BandwidthThrottle.ts#L21)

Token-bucket throttle used to pace transfer chunks.

## Methods

### consume()

```ts
consume(bytes, signal?): Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:33](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/BandwidthThrottle.ts#L33)

Consumes `bytes` from the bucket, awaiting refill when not enough tokens are available.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bytes` | `number` | Non-negative byte count being released by the throttle. |
| `signal?` | `AbortSignal` | Optional abort signal that interrupts pending waits. |

#### Returns

`Promise`\<`void`\>

#### Throws

[AbortError](../classes/AbortError.md) When the signal is aborted while waiting.

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="burstbytes"></a> `burstBytes` | `readonly` | `number` | Burst capacity in bytes available before throttling kicks in. | [src/transfers/BandwidthThrottle.ts:25](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/BandwidthThrottle.ts#L25) |
| <a id="bytespersecond"></a> `bytesPerSecond` | `readonly` | `number` | Maximum sustained transfer rate in bytes per second. | [src/transfers/BandwidthThrottle.ts:23](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/BandwidthThrottle.ts#L23) |
