[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResult

# Interface: TransferResult

Defined in: [src/types/public.ts:393](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L393)

Final summary for a completed transfer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/types/public.ts:407](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L407) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred. | [src/types/public.ts:399](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L399) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the transfer workflow. | [src/types/public.ts:413](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L413) |
| <a id="completedat"></a> `completedAt` | `Date` | Time at which the transfer completed. | [src/types/public.ts:403](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L403) |
| <a id="destinationpath"></a> `destinationPath` | `string` | Local or remote destination path for the completed transfer. | [src/types/public.ts:397](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L397) |
| <a id="durationms"></a> `durationMs` | `number` | Total transfer duration in milliseconds. | [src/types/public.ts:405](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L405) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed from a prior partial state. | [src/types/public.ts:409](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L409) |
| <a id="sourcepath"></a> `sourcePath?` | `string` | Local or remote source path when known for the operation. | [src/types/public.ts:395](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L395) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:401](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L401) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/types/public.ts:411](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L411) |
