[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferPlanStep

# Interface: TransferPlanStep

Defined in: [src/transfers/TransferPlan.ts:12](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L12)

Step inside a transfer plan.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="action"></a> `action` | [`TransferPlanAction`](../type-aliases/TransferPlanAction.md) | Action the step would perform. | [src/transfers/TransferPlan.ts:16](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L16) |
| <a id="destination"></a> `destination?` | [`TransferEndpoint`](TransferEndpoint.md) | Destination endpoint when the action writes data. | [src/transfers/TransferPlan.ts:20](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L20) |
| <a id="destructive"></a> `destructive?` | `boolean` | Whether this step may remove or replace data. | [src/transfers/TransferPlan.ts:24](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L24) |
| <a id="expectedbytes"></a> `expectedBytes?` | `number` | Expected bytes affected by the step when known. | [src/transfers/TransferPlan.ts:22](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L22) |
| <a id="id"></a> `id` | `string` | Stable step identifier within the plan. | [src/transfers/TransferPlan.ts:14](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L14) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/transfers/TransferPlan.ts:28](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L28) |
| <a id="reason"></a> `reason?` | `string` | Human-readable reason for planned or skipped work. | [src/transfers/TransferPlan.ts:26](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L26) |
| <a id="source"></a> `source?` | [`TransferEndpoint`](TransferEndpoint.md) | Source endpoint when the action reads data. | [src/transfers/TransferPlan.ts:18](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferPlan.ts#L18) |
