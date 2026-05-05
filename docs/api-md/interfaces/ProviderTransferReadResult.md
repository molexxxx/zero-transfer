[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferReadResult

# Interface: ProviderTransferReadResult

Defined in: [src/providers/ProviderTransferOperations.ts:40](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L40)

Result returned by provider read implementations.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytesread"></a> `bytesRead?` | `number` | Bytes already read by the provider before returning the content stream, if any. | [src/providers/ProviderTransferOperations.ts:44](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L44) |
| <a id="checksum"></a> `checksum?` | `string` | Checksum produced while opening or reading the source. | [src/providers/ProviderTransferOperations.ts:50](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L50) |
| <a id="content"></a> `content` | [`TransferDataSource`](../type-aliases/TransferDataSource.md) | Content stream produced by the provider. | [src/providers/ProviderTransferOperations.ts:42](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L42) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Expected total bytes for the content stream when known. | [src/providers/ProviderTransferOperations.ts:46](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L46) |
| <a id="verification"></a> `verification?` | [`TransferVerificationResult`](TransferVerificationResult.md) | Verification details produced while opening or reading the source. | [src/providers/ProviderTransferOperations.ts:48](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L48) |
| <a id="warnings"></a> `warnings?` | `string`[] | Non-fatal warnings produced by the read side. | [src/providers/ProviderTransferOperations.ts:52](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L52) |
