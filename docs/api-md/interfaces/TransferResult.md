[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResult

# Interface: TransferResult

Defined in: [src/types/public.ts:334](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L334)

Final summary for a completed transfer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/types/public.ts:348](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L348) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred. | [src/types/public.ts:340](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L340) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the transfer workflow. | [src/types/public.ts:354](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L354) |
| <a id="completedat"></a> `completedAt` | `Date` | Time at which the transfer completed. | [src/types/public.ts:344](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L344) |
| <a id="destinationpath"></a> `destinationPath` | `string` | Local or remote destination path for the completed transfer. | [src/types/public.ts:338](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L338) |
| <a id="durationms"></a> `durationMs` | `number` | Total transfer duration in milliseconds. | [src/types/public.ts:346](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L346) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed from a prior partial state. | [src/types/public.ts:350](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L350) |
| <a id="sourcepath"></a> `sourcePath?` | `string` | Local or remote source path when known for the operation. | [src/types/public.ts:336](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L336) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:342](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L342) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/types/public.ts:352](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L352) |
