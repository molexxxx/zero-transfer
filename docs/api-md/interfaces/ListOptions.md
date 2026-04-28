[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ListOptions

# Interface: ListOptions

Defined in: [src/types/public.ts:228](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L228)

Options for remote directory listing operations.

## Properties

| Property                                    | Type          | Description                                                                          | Defined in                                                                                                                                    |
| ------------------------------------------- | ------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="includehidden"></a> `includeHidden?` | `boolean`     | Include hidden or dot-prefixed entries when the protocol/listing format supports it. | [src/types/public.ts:232](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L232) |
| <a id="recursive"></a> `recursive?`         | `boolean`     | Recursively walk child directories when supported by the adapter.                    | [src/types/public.ts:230](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L230) |
| <a id="signal"></a> `signal?`               | `AbortSignal` | Abort signal used to cancel the listing operation.                                   | [src/types/public.ts:234](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L234) |
