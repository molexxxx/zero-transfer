[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `delayMs` | `number` |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
