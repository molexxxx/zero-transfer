[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MemoryTransferCheckpointStoreOptions

# Interface: MemoryTransferCheckpointStoreOptions

Defined in: src/transfers/TransferCheckpointStore.ts:213

Options accepted by [createMemoryTransferCheckpointStore](../functions/createMemoryTransferCheckpointStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="now"></a> `now?` | () => `number` | Clock override for deterministic tests. Defaults to `Date.now`. | src/transfers/TransferCheckpointStore.ts:217 |
| <a id="ttlms"></a> `ttlMs?` | `number` | Checkpoint time-to-live in milliseconds. Defaults to 7 days. | src/transfers/TransferCheckpointStore.ts:215 |
