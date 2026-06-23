[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResumableBatchResult

# Interface: ResumableBatchResult

Defined in: [src/transfers/resumableBatch.ts:270](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L270)

Result returned by [runResumableBatch](../functions/runResumableBatch.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="complete"></a> `complete` | `boolean` | Whether every executable step in the plan has now completed. | [src/transfers/resumableBatch.ts:280](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L280) |
| <a id="completedstepids"></a> `completedStepIds` | `string`[] | Every executable step id completed so far, across all runs. | [src/transfers/resumableBatch.ts:276](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L276) |
| <a id="previouslycompletedstepids"></a> `previouslyCompletedStepIds` | `string`[] | Step ids skipped this run because a prior run already completed them. | [src/transfers/resumableBatch.ts:274](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L274) |
| <a id="remainingstepids"></a> `remainingStepIds` | `string`[] | Executable step ids still incomplete after this run. | [src/transfers/resumableBatch.ts:278](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L278) |
| <a id="summary"></a> `summary` | [`TransferQueueSummary`](TransferQueueSummary.md) | Queue drain summary for the steps executed in this run. | [src/transfers/resumableBatch.ts:272](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L272) |
