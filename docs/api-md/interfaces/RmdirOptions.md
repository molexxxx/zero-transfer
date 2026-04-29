[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RmdirOptions

# Interface: RmdirOptions

Defined in: [src/types/public.ts:344](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/types/public.ts#L344)

Options for removing a remote directory.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ignoremissing"></a> `ignoreMissing?` | `boolean` | When true, do not throw if the path does not exist. | [src/types/public.ts:350](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/types/public.ts#L350) |
| <a id="recursive"></a> `recursive?` | `boolean` | Recursively remove non-empty directory contents. | [src/types/public.ts:348](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/types/public.ts#L348) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the operation. | [src/types/public.ts:346](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/types/public.ts#L346) |
