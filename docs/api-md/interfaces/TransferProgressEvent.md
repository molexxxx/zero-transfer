[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:314](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L314)

Progress snapshot emitted while a transfer is running.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Current average throughput in bytes per second. | [src/types/public.ts:326](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L326) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far. | [src/types/public.ts:318](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L318) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Elapsed transfer time in milliseconds. | [src/types/public.ts:324](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L324) |
| <a id="percent"></a> `percent?` | `number` | Completion percentage when `totalBytes` is known. | [src/types/public.ts:328](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L328) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:322](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L322) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:320](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L320) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used to correlate logs and events. | [src/types/public.ts:316](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L316) |
