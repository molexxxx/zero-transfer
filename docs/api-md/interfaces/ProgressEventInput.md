[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProgressEventInput

# Interface: ProgressEventInput

Defined in: [src/services/TransferService.ts:36](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L36)

Input used to create a transfer progress event.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes transferred so far. | [src/services/TransferService.ts:40](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L40) |
| <a id="now"></a> `now?` | `Date` | Time to use for the progress calculation; defaults to current time. | [src/services/TransferService.ts:44](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L44) |
| <a id="startedat"></a> `startedAt` | `Date` | Time the transfer began. | [src/services/TransferService.ts:42](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L42) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when known. | [src/services/TransferService.ts:46](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L46) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier for correlation. | [src/services/TransferService.ts:38](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/services/TransferService.ts#L38) |
