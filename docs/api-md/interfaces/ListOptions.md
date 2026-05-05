[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ListOptions

# Interface: ListOptions

Defined in: [src/types/public.ts:313](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L313)

Options for remote directory listing operations.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="includehidden"></a> `includeHidden?` | `boolean` | Include hidden or dot-prefixed entries when the protocol/listing format supports it. | [src/types/public.ts:317](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L317) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively walk child directories when supported by the adapter. | [src/types/public.ts:315](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L315) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the listing operation. | [src/types/public.ts:319](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L319) |
