[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferPlanInput

# Interface: TransferPlanInput

Defined in: [src/transfers/TransferPlan.ts:32](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L32)

Input used to create a transfer plan.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="dryrun"></a> `dryRun?` | `boolean` | Whether the plan is informational only. Defaults to `true`. | [src/transfers/TransferPlan.ts:38](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L38) |
| <a id="id"></a> `id` | `string` | Stable plan identifier. | [src/transfers/TransferPlan.ts:34](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L34) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/transfers/TransferPlan.ts:44](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L44) |
| <a id="now"></a> `now?` | () => `Date` | Clock used for deterministic tests. Defaults to `new Date()`. | [src/transfers/TransferPlan.ts:40](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L40) |
| <a id="steps"></a> `steps` | [`TransferPlanStep`](TransferPlanStep.md)[] | Planned steps in execution order. | [src/transfers/TransferPlan.ts:36](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L36) |
| <a id="warnings"></a> `warnings?` | `string`[] | Non-fatal plan warnings. | [src/transfers/TransferPlan.ts:42](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L42) |
