[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferByteRange

# Interface: TransferByteRange

Defined in: [src/providers/ProviderTransferOperations.ts:20](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/ProviderTransferOperations.ts#L20)

Byte range requested from a readable provider endpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="length"></a> `length?` | `number` | Maximum number of bytes to read when known. | [src/providers/ProviderTransferOperations.ts:24](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/ProviderTransferOperations.ts#L24) |
| <a id="offset"></a> `offset` | `number` | Zero-based byte offset where reading should begin. | [src/providers/ProviderTransferOperations.ts:22](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/ProviderTransferOperations.ts#L22) |
