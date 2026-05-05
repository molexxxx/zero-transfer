[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `delayMs` | `number` |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
