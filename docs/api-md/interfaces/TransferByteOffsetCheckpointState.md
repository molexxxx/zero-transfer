[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferByteOffsetCheckpointState

# Interface: TransferByteOffsetCheckpointState

Defined in: [src/transfers/TransferCheckpointStore.ts:93](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L93)

Byte-offset checkpoint state used by sequential-append providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="committedbytes"></a> `committedBytes` | `number` | Bytes durably committed at the destination. | [src/transfers/TransferCheckpointStore.ts:96](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L96) |
| <a id="kind"></a> `kind` | `"byte-offset"` | - | [src/transfers/TransferCheckpointStore.ts:94](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L94) |
