[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResult

# Interface: TransferResult

Defined in: [src/types/public.ts:395](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L395)

Final summary for a completed transfer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/types/public.ts:409](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L409) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred. | [src/types/public.ts:401](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L401) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the transfer workflow. | [src/types/public.ts:415](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L415) |
| <a id="completedat"></a> `completedAt` | `Date` | Time at which the transfer completed. | [src/types/public.ts:405](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L405) |
| <a id="destinationpath"></a> `destinationPath` | `string` | Local or remote destination path for the completed transfer. | [src/types/public.ts:399](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L399) |
| <a id="durationms"></a> `durationMs` | `number` | Total transfer duration in milliseconds. | [src/types/public.ts:407](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L407) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed from a prior partial state. | [src/types/public.ts:411](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L411) |
| <a id="sourcepath"></a> `sourcePath?` | `string` | Local or remote source path when known for the operation. | [src/types/public.ts:397](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L397) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:403](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L403) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/types/public.ts:413](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L413) |
