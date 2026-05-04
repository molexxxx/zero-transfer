[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createBandwidthThrottle

# Function: createBandwidthThrottle()

```ts
function createBandwidthThrottle(limit, options?): BandwidthThrottle | undefined;
```

Defined in: [src/transfers/BandwidthThrottle.ts:48](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/BandwidthThrottle.ts#L48)

Creates a token-bucket throttle that paces an asynchronous data pipeline to
a sustained [TransferBandwidthLimit](../interfaces/TransferBandwidthLimit.md).

Returns `undefined` when no limit is supplied so callers can omit throttling
without conditional branches at the call site.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `limit` | \| [`TransferBandwidthLimit`](../interfaces/TransferBandwidthLimit.md) \| `undefined` | Optional throughput limit. Returns `undefined` when omitted. |
| `options` | [`BandwidthThrottleOptions`](../interfaces/BandwidthThrottleOptions.md) | Optional clock/sleep overrides for deterministic tests. |

## Returns

[`BandwidthThrottle`](../interfaces/BandwidthThrottle.md) \| `undefined`

Throttle implementation when a limit is supplied, otherwise `undefined`.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the supplied limit shape is invalid.
