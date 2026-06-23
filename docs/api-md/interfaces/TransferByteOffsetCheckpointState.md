[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferByteOffsetCheckpointState

# Interface: TransferByteOffsetCheckpointState

Defined in: [src/transfers/TransferCheckpointStore.ts:93](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L93)

Byte-offset checkpoint state used by sequential-append providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="committedbytes"></a> `committedBytes` | `number` | Bytes durably committed at the destination. | [src/transfers/TransferCheckpointStore.ts:96](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L96) |
| <a id="kind"></a> `kind` | `"byte-offset"` | - | [src/transfers/TransferCheckpointStore.ts:94](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L94) |
