[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:356](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L356)

Progress snapshot emitted while a transfer is running.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Current average throughput in bytes per second. | [src/types/public.ts:368](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L368) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far. | [src/types/public.ts:360](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L360) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Elapsed transfer time in milliseconds. | [src/types/public.ts:366](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L366) |
| <a id="percent"></a> `percent?` | `number` | Completion percentage when `totalBytes` is known. | [src/types/public.ts:370](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L370) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:364](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L364) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:362](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L362) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used to correlate logs and events. | [src/types/public.ts:358](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L358) |
