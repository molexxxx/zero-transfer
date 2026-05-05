[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferPlanSummary

# Interface: TransferPlanSummary

Defined in: [src/transfers/TransferPlan.ts:64](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L64)

Summary of a transfer plan.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="actions"></a> `actions` | `Record`\<`string`, `number`\> | Counts grouped by action. | [src/transfers/TransferPlan.ts:76](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L76) |
| <a id="destructivesteps"></a> `destructiveSteps` | `number` | Number of destructive steps. | [src/transfers/TransferPlan.ts:72](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L72) |
| <a id="executablesteps"></a> `executableSteps` | `number` | Number of executable steps. | [src/transfers/TransferPlan.ts:68](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L68) |
| <a id="skippedsteps"></a> `skippedSteps` | `number` | Number of skipped steps. | [src/transfers/TransferPlan.ts:70](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L70) |
| <a id="totalexpectedbytes"></a> `totalExpectedBytes` | `number` | Sum of expected bytes for steps that provide sizes. | [src/transfers/TransferPlan.ts:74](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L74) |
| <a id="totalsteps"></a> `totalSteps` | `number` | Total number of steps. | [src/transfers/TransferPlan.ts:66](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L66) |
