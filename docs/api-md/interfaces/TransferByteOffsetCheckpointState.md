[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferByteOffsetCheckpointState

# Interface: TransferByteOffsetCheckpointState

Defined in: src/transfers/TransferCheckpointStore.ts:93

Byte-offset checkpoint state used by sequential-append providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="committedbytes"></a> `committedBytes` | `number` | Bytes durably committed at the destination. | src/transfers/TransferCheckpointStore.ts:96 |
| <a id="kind"></a> `kind` | `"byte-offset"` | - | src/transfers/TransferCheckpointStore.ts:94 |
