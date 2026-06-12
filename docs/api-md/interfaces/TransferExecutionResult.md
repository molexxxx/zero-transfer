[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferExecutionResult

# Interface: TransferExecutionResult

Defined in: [src/transfers/TransferJob.ts:109](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L109)

Result returned by a transfer operation implementation.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes transferred by the completed operation. | [src/transfers/TransferJob.ts:111](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L111) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:121](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L121) |
| <a id="resumed"></a> `resumed?` | `boolean` | Whether the operation resumed prior partial work. | [src/transfers/TransferJob.ts:115](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L115) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when discovered during execution. | [src/transfers/TransferJob.ts:113](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L113) |
| <a id="verification"></a> `verification?` | [`TransferVerificationResult`](TransferVerificationResult.md) | Normalized post-transfer verification details. | [src/transfers/TransferJob.ts:119](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L119) |
| <a id="verified"></a> `verified?` | `boolean` | Whether post-transfer verification completed successfully. | [src/transfers/TransferJob.ts:117](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L117) |
| <a id="warnings"></a> `warnings?` | `string`[] | Non-fatal warnings produced during execution. | [src/transfers/TransferJob.ts:123](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L123) |
