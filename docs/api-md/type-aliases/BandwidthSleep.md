[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `delayMs` | `number` |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
