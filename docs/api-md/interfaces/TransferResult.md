[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResult

# Interface: TransferResult

Defined in: [src/types/public.ts:376](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L376)

Final summary for a completed transfer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/types/public.ts:390](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L390) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred. | [src/types/public.ts:382](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L382) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the transfer workflow. | [src/types/public.ts:396](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L396) |
| <a id="completedat"></a> `completedAt` | `Date` | Time at which the transfer completed. | [src/types/public.ts:386](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L386) |
| <a id="destinationpath"></a> `destinationPath` | `string` | Local or remote destination path for the completed transfer. | [src/types/public.ts:380](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L380) |
| <a id="durationms"></a> `durationMs` | `number` | Total transfer duration in milliseconds. | [src/types/public.ts:388](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L388) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed from a prior partial state. | [src/types/public.ts:392](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L392) |
| <a id="sourcepath"></a> `sourcePath?` | `string` | Local or remote source path when known for the operation. | [src/types/public.ts:378](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L378) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:384](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L384) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/types/public.ts:394](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L394) |
