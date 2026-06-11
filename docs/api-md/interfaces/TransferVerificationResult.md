[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferVerificationResult

# Interface: TransferVerificationResult

Defined in: [src/transfers/TransferJob.ts:93](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L93)

Normalized post-transfer verification details.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="actualchecksum"></a> `actualChecksum?` | `string` | Actual checksum observed by the operation. | [src/transfers/TransferJob.ts:103](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L103) |
| <a id="checksum"></a> `checksum?` | `string` | Checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:99](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L99) |
| <a id="details"></a> `details?` | `Record`\<`string`, `unknown`\> | Caller-defined verification details retained for diagnostics. | [src/transfers/TransferJob.ts:105](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L105) |
| <a id="expectedchecksum"></a> `expectedChecksum?` | `string` | Expected checksum when a checksum comparison was performed. | [src/transfers/TransferJob.ts:101](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L101) |
| <a id="method"></a> `method?` | `string` | Verification method, such as checksum, size, timestamp, or provider-native. | [src/transfers/TransferJob.ts:97](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L97) |
| <a id="verified"></a> `verified` | `boolean` | Whether verification completed successfully. | [src/transfers/TransferJob.ts:95](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferJob.ts#L95) |
