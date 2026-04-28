[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / BandwidthSleep

# Type Alias: BandwidthSleep

```ts
type BandwidthSleep = (delayMs, signal?) => Promise<void>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:10](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/BandwidthThrottle.ts#L10)

Sleep helper signature used by [createBandwidthThrottle](../functions/createBandwidthThrottle.md).

## Parameters

| Parameter | Type          |
| --------- | ------------- |
| `delayMs` | `number`      |
| `signal?` | `AbortSignal` |

## Returns

`Promise`\<`void`\>
