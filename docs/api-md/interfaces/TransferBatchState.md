[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferBatchState

# Interface: TransferBatchState

Defined in: src/transfers/resumableBatch.ts:127

Persisted batch progress: which plan steps have completed.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="completedstepids"></a> `completedStepIds` | `string`[] | Step ids that completed successfully, in completion order. | src/transfers/resumableBatch.ts:133 |
| <a id="planid"></a> `planId` | `string` | Plan this state belongs to. | src/transfers/resumableBatch.ts:131 |
| <a id="updatedatms"></a> `updatedAtMs` | `number` | Epoch ms when this state was last updated. | src/transfers/resumableBatch.ts:135 |
| <a id="version"></a> `version` | `1` | Record schema version. | src/transfers/resumableBatch.ts:129 |
