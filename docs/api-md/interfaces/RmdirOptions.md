[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RmdirOptions

# Interface: RmdirOptions

Defined in: [src/types/public.ts:363](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L363)

Options for removing a remote directory.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ignoremissing"></a> `ignoreMissing?` | `boolean` | When true, do not throw if the path does not exist. | [src/types/public.ts:369](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L369) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively remove non-empty directory contents. | [src/types/public.ts:367](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L367) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the operation. | [src/types/public.ts:365](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L365) |
