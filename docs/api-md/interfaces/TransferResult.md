[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / TransferResult

# Interface: TransferResult

Defined in: [src/types/public.ts:268](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L268)

Final summary for a completed transfer.

## Properties

| Property                                                   | Type      | Description                                                            | Defined in                                                                                                                                    |
| ---------------------------------------------------------- | --------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number`  | Average throughput in bytes per second.                                | [src/types/public.ts:282](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L282) |
| <a id="bytestransferred"></a> `bytesTransferred`           | `number`  | Total bytes transferred.                                               | [src/types/public.ts:274](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L274) |
| <a id="checksum"></a> `checksum?`                          | `string`  | Optional checksum value produced or verified by the transfer workflow. | [src/types/public.ts:288](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L288) |
| <a id="completedat"></a> `completedAt`                     | `Date`    | Time at which the transfer completed.                                  | [src/types/public.ts:278](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L278) |
| <a id="destinationpath"></a> `destinationPath`             | `string`  | Local or remote destination path for the completed transfer.           | [src/types/public.ts:272](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L272) |
| <a id="durationms"></a> `durationMs`                       | `number`  | Total transfer duration in milliseconds.                               | [src/types/public.ts:280](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L280) |
| <a id="resumed"></a> `resumed`                             | `boolean` | Whether the transfer resumed from a prior partial state.               | [src/types/public.ts:284](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L284) |
| <a id="sourcepath"></a> `sourcePath?`                      | `string`  | Local or remote source path when known for the operation.              | [src/types/public.ts:270](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L270) |
| <a id="startedat"></a> `startedAt`                         | `Date`    | Time at which the transfer began.                                      | [src/types/public.ts:276](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L276) |
| <a id="verified"></a> `verified`                           | `boolean` | Whether post-transfer verification completed successfully.             | [src/types/public.ts:286](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L286) |
