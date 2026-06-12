[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointRecord

# Interface: TransferCheckpointRecord

Defined in: src/transfers/TransferCheckpointStore.ts:118

Persisted checkpoint record.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="createdatms"></a> `createdAtMs` | `number` | Epoch ms when this checkpoint was first created. | src/transfers/TransferCheckpointStore.ts:126 |
| <a id="fingerprint"></a> `fingerprint` | [`TransferSourceFingerprint`](TransferSourceFingerprint.md) | Source fingerprint captured when the checkpoint was written. | src/transfers/TransferCheckpointStore.ts:122 |
| <a id="pid"></a> `pid` | `number` | Process id that last wrote the record (concurrent-writer diagnostics). | src/transfers/TransferCheckpointStore.ts:130 |
| <a id="state"></a> `state` | [`TransferCheckpointState`](../type-aliases/TransferCheckpointState.md) | Progress state. | src/transfers/TransferCheckpointStore.ts:124 |
| <a id="updatedatms"></a> `updatedAtMs` | `number` | Epoch ms when this checkpoint was last updated. | src/transfers/TransferCheckpointStore.ts:128 |
| <a id="version"></a> `version` | `1` | Record schema version. | src/transfers/TransferCheckpointStore.ts:120 |
