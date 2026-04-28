[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / BandwidthThrottleOptions

# Interface: BandwidthThrottleOptions

Defined in: [src/transfers/BandwidthThrottle.ts:13](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/BandwidthThrottle.ts#L13)

Construction overrides for deterministic tests.

## Properties

| Property                    | Type                                                  | Description                                                                                | Defined in                                                                                                                                                                |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="now"></a> `now?`     | () => `number`                                        | Monotonic clock returning milliseconds since an arbitrary epoch. Defaults to `Date.now`.   | [src/transfers/BandwidthThrottle.ts:15](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/BandwidthThrottle.ts#L15) |
| <a id="sleep"></a> `sleep?` | [`BandwidthSleep`](../type-aliases/BandwidthSleep.md) | Sleep implementation honoring an optional abort signal. Defaults to a `setTimeout` helper. | [src/transfers/BandwidthThrottle.ts:17](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/BandwidthThrottle.ts#L17) |
