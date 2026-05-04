[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RmdirOptions

# Interface: RmdirOptions

Defined in: [src/types/public.ts:361](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L361)

Options for removing a remote directory.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ignoremissing"></a> `ignoreMissing?` | `boolean` | When true, do not throw if the path does not exist. | [src/types/public.ts:367](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L367) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively remove non-empty directory contents. | [src/types/public.ts:365](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L365) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the operation. | [src/types/public.ts:363](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L363) |
