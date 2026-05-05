[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferPlan

# Interface: TransferPlan

Defined in: [src/transfers/TransferPlan.ts:48](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L48)

Provider-neutral transfer plan.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="createdat"></a> `createdAt` | `Date` | Time the plan was created. | [src/transfers/TransferPlan.ts:54](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L54) |
| <a id="dryrun"></a> `dryRun` | `boolean` | Whether this plan should be treated as a dry run. | [src/transfers/TransferPlan.ts:52](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L52) |
| <a id="id"></a> `id` | `string` | Stable plan identifier. | [src/transfers/TransferPlan.ts:50](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L50) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/transfers/TransferPlan.ts:60](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L60) |
| <a id="steps"></a> `steps` | [`TransferPlanStep`](TransferPlanStep.md)[] | Planned steps in execution order. | [src/transfers/TransferPlan.ts:56](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L56) |
| <a id="warnings"></a> `warnings` | `string`[] | Non-fatal plan warnings. | [src/transfers/TransferPlan.ts:58](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L58) |
