[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointPart

# Interface: TransferCheckpointPart

Defined in: [src/transfers/TransferCheckpointStore.ts:83](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L83)

Single completed part recorded in a parts-kind checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Cumulative byte offset reached after this part (exclusive). | [src/transfers/TransferCheckpointStore.ts:87](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L87) |
| <a id="partnumber"></a> `partNumber` | `number` | One-based part number. | [src/transfers/TransferCheckpointStore.ts:85](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L85) |
| <a id="token"></a> `token?` | `string` | Provider part token (S3 part ETag, Azure block id) when required to finalize. | [src/transfers/TransferCheckpointStore.ts:89](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L89) |
