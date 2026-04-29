[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferVerificationResult

# Interface: TransferVerificationResult

Defined in: [src/transfers/TransferJob.ts:61](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L61)

Normalized post-transfer verification details.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="actualchecksum"></a> `actualChecksum?` | `string` | Actual checksum observed by the operation. | [src/transfers/TransferJob.ts:71](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L71) |
| <a id="checksum"></a> `checksum?` | `string` | Checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:67](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L67) |
| <a id="details"></a> `details?` | `Record`\<`string`, `unknown`\> | Caller-defined verification details retained for diagnostics. | [src/transfers/TransferJob.ts:73](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L73) |
| <a id="expectedchecksum"></a> `expectedChecksum?` | `string` | Expected checksum when a checksum comparison was performed. | [src/transfers/TransferJob.ts:69](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L69) |
| <a id="method"></a> `method?` | `string` | Verification method, such as checksum, size, timestamp, or provider-native. | [src/transfers/TransferJob.ts:65](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L65) |
| <a id="verified"></a> `verified` | `boolean` | Whether verification completed successfully. | [src/transfers/TransferJob.ts:63](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/transfers/TransferJob.ts#L63) |
