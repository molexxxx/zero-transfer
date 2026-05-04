[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:373](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L373)

Progress snapshot emitted while a transfer is running.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Current average throughput in bytes per second. | [src/types/public.ts:385](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L385) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far. | [src/types/public.ts:377](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L377) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Elapsed transfer time in milliseconds. | [src/types/public.ts:383](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L383) |
| <a id="percent"></a> `percent?` | `number` | Completion percentage when `totalBytes` is known. | [src/types/public.ts:387](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L387) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:381](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L381) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:379](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L379) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used to correlate logs and events. | [src/types/public.ts:375](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L375) |
