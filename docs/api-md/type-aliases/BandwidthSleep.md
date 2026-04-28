[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type          |
| --------- | ------------- |
| `delayMs` | `number`      |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
