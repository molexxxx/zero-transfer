[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSyncPlan

# Function: createSyncPlan()

```ts
function createSyncPlan(options): TransferPlan;
```

Defined in: [src/sync/createSyncPlan.ts:84](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L84)

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
