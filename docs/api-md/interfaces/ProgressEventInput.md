[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProgressEventInput

# Interface: ProgressEventInput

Defined in: [src/services/TransferService.ts:36](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L36)

Input used to create a transfer progress event.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes transferred so far. | [src/services/TransferService.ts:40](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L40) |
| <a id="now"></a> `now?` | `Date` | Time to use for the progress calculation; defaults to current time. | [src/services/TransferService.ts:44](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L44) |
| <a id="startedat"></a> `startedAt` | `Date` | Time the transfer began. | [src/services/TransferService.ts:42](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L42) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when known. | [src/services/TransferService.ts:46](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L46) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier for correlation. | [src/services/TransferService.ts:38](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/services/TransferService.ts#L38) |
