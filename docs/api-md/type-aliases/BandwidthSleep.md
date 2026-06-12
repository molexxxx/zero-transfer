[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `delayMs` | `number` |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
