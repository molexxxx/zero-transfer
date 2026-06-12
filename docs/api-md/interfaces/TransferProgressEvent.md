[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:379](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L379)

Progress snapshot emitted while a transfer is running.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Current average throughput in bytes per second. | [src/types/public.ts:391](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L391) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far. | [src/types/public.ts:383](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L383) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Elapsed transfer time in milliseconds. | [src/types/public.ts:389](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L389) |
| <a id="percent"></a> `percent?` | `number` | Completion percentage when `totalBytes` is known. | [src/types/public.ts:393](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L393) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:387](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L387) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:385](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L385) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used to correlate logs and events. | [src/types/public.ts:381](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L381) |
