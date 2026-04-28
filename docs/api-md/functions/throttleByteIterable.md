[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / throttleByteIterable

# Function: throttleByteIterable()

```ts
function throttleByteIterable(
  source,
  throttle,
  signal?,
): AsyncIterable<Uint8Array<ArrayBufferLike>>;
```

Defined in: [src/transfers/BandwidthThrottle.ts:125](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/BandwidthThrottle.ts#L125)

Wraps an async iterable of byte chunks so each chunk is released only after
the throttle has admitted its byte count.

When `throttle` is `undefined`, the source iterable is returned unchanged.

## Parameters

| Parameter  | Type                                                                     | Description                                       |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| `source`   | `AsyncIterable`\<`Uint8Array`\<`ArrayBufferLike`\>\>                     | Async iterable that produces byte chunks.         |
| `throttle` | [`BandwidthThrottle`](../interfaces/BandwidthThrottle.md) \| `undefined` | Optional throttle that paces chunk emission.      |
| `signal?`  | `AbortSignal`                                                            | Optional abort signal interrupting pending waits. |

## Returns

`AsyncIterable`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Async generator emitting the original chunks at the throttled rate.
