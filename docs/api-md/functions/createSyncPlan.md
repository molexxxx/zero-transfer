[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSyncPlan

# Function: createSyncPlan()

```ts
function createSyncPlan(options): TransferPlan;
```

Defined in: [src/sync/createSyncPlan.ts:84](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/sync/createSyncPlan.ts#L84)

Builds a [TransferPlan](../interfaces/TransferPlan.md) that reconciles two remote subtrees.

Plan steps are derived from a [RemoteTreeDiff](../interfaces/RemoteTreeDiff.md); the function does not perform
any I/O. Direction, delete policy, and conflict policy control which entries
become executable transfers and which become `skip` steps.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateSyncPlanOptions`](../interfaces/CreateSyncPlanOptions.md) | Inputs and policies that shape the plan. |

## Returns

[`TransferPlan`](../interfaces/TransferPlan.md)

Transfer plan ready for `createTransferJobsFromPlan` or queue execution.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When `conflictPolicy: "error"` encounters a conflict.
