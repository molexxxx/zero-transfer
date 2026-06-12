[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferPartsCheckpointState

# Interface: TransferPartsCheckpointState

Defined in: [src/transfers/TransferCheckpointStore.ts:100](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L100)

Parts checkpoint state used by multipart/staged-block providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="committedbytes"></a> `committedBytes` | `number` | Bytes durably committed at the destination (end of the contiguous prefix). | [src/transfers/TransferCheckpointStore.ts:107](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L107) |
| <a id="kind"></a> `kind` | `"parts"` | - | [src/transfers/TransferCheckpointStore.ts:101](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L101) |
| <a id="parts"></a> `parts` | [`TransferCheckpointPart`](TransferCheckpointPart.md)[] | Contiguous prefix of completed parts in part-number order. | [src/transfers/TransferCheckpointStore.ts:105](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L105) |
| <a id="partsizebytes"></a> `partSizeBytes` | `number` | Part size the upload was cut with; resume must reuse it. | [src/transfers/TransferCheckpointStore.ts:109](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L109) |
| <a id="uploadtoken"></a> `uploadToken` | `string` | Provider upload token (S3 `uploadId`, Azure block-id nonce, tus upload URL). | [src/transfers/TransferCheckpointStore.ts:103](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L103) |
