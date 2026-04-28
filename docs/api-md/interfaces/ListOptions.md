[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ListOptions

# Interface: ListOptions

Defined in: [src/types/public.ts:294](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L294)

Options for remote directory listing operations.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="includehidden"></a> `includeHidden?` | `boolean` | Include hidden or dot-prefixed entries when the protocol/listing format supports it. | [src/types/public.ts:298](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L298) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively walk child directories when supported by the adapter. | [src/types/public.ts:296](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L296) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the listing operation. | [src/types/public.ts:300](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L300) |
