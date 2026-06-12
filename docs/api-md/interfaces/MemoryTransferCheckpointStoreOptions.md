[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MemoryTransferCheckpointStoreOptions

# Interface: MemoryTransferCheckpointStoreOptions

Defined in: [src/transfers/TransferCheckpointStore.ts:213](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L213)

Options accepted by [createMemoryTransferCheckpointStore](../functions/createMemoryTransferCheckpointStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="now"></a> `now?` | () => `number` | Clock override for deterministic tests. Defaults to `Date.now`. | [src/transfers/TransferCheckpointStore.ts:217](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L217) |
| <a id="ttlms"></a> `ttlMs?` | `number` | Checkpoint time-to-live in milliseconds. Defaults to 7 days. | [src/transfers/TransferCheckpointStore.ts:215](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L215) |
