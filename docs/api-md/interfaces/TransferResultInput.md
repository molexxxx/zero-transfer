[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResultInput

# Interface: TransferResultInput

Defined in: [src/services/TransferService.ts:14](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L14)

Input used to create a final transfer result.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred. | [src/services/TransferService.ts:20](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L20) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the transfer. | [src/services/TransferService.ts:30](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L30) |
| <a id="completedat"></a> `completedAt` | `Date` | Time the transfer completed. | [src/services/TransferService.ts:24](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L24) |
| <a id="destinationpath"></a> `destinationPath` | `string` | Local or remote destination path for the transfer. | [src/services/TransferService.ts:18](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L18) |
| <a id="resumed"></a> `resumed?` | `boolean` | Whether the transfer resumed from an earlier partial state. | [src/services/TransferService.ts:26](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L26) |
| <a id="sourcepath"></a> `sourcePath?` | `string` | Local or remote source path when known. | [src/services/TransferService.ts:16](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L16) |
| <a id="startedat"></a> `startedAt` | `Date` | Time the transfer began. | [src/services/TransferService.ts:22](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L22) |
| <a id="verified"></a> `verified?` | `boolean` | Whether post-transfer verification succeeded. | [src/services/TransferService.ts:28](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/services/TransferService.ts#L28) |
