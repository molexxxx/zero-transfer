[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / throttleByteIterable

# Function: throttleByteIterable()

```ts
function throttleByteIterable(
   source, 
   throttle, 
signal?): AsyncIterable<Uint8Array<ArrayBufferLike>>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:125](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/transfers/BandwidthThrottle.ts#L125)

Wraps an async iterable of byte chunks so each chunk is released only after
the throttle has admitted its byte count.

When `throttle` is `undefined`, the source iterable is returned unchanged.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `AsyncIterable`\<`Uint8Array`\<`ArrayBufferLike`\>\> | Async iterable that produces byte chunks. |
| `throttle` | [`BandwidthThrottle`](../interfaces/BandwidthThrottle.md) \| `undefined` | Optional throttle that paces chunk emission. |
| `signal?` | `AbortSignal` | Optional abort signal interrupting pending waits. |

## Returns

`AsyncIterable`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Async generator emitting the original chunks at the throttled rate.
