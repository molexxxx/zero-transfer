[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BandwidthThrottleOptions

# Interface: BandwidthThrottleOptions

Defined in: [src/transfers/BandwidthThrottle.ts:13](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/transfers/BandwidthThrottle.ts#L13)

Construction overrides for deterministic tests.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="now"></a> `now?` | () => `number` | Monotonic clock returning milliseconds since an arbitrary epoch. Defaults to `Date.now`. | [src/transfers/BandwidthThrottle.ts:15](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/transfers/BandwidthThrottle.ts#L15) |
| <a id="sleep"></a> `sleep?` | [`BandwidthSleep`](../type-aliases/BandwidthSleep.md) | Sleep implementation honoring an optional abort signal. Defaults to a `setTimeout` helper. | [src/transfers/BandwidthThrottle.ts:17](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/transfers/BandwidthThrottle.ts#L17) |
