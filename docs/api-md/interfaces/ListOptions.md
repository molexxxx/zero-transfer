[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ListOptions

# Interface: ListOptions

Defined in: [src/types/public.ts:317](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L317)

Options for remote directory listing operations.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="includehidden"></a> `includeHidden?` | `boolean` | Include hidden or dot-prefixed entries when the protocol/listing format supports it. | [src/types/public.ts:321](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L321) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively walk child directories when supported by the adapter. | [src/types/public.ts:319](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L319) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the listing operation. | [src/types/public.ts:323](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L323) |
