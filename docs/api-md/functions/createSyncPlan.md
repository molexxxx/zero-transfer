[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSyncPlan

# Function: createSyncPlan()

```ts
function createSyncPlan(options): TransferPlan;
```

Defined in: [src/sync/createSyncPlan.ts:109](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/createSyncPlan.ts#L109)

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

## Example

```ts
import {
  createSyncPlan,
  diffRemoteTrees,
  summarizeTransferPlan,
} from "@zero-transfer/sdk";

const diff = await diffRemoteTrees(
  srcSession.fs, "/dist",
  dstSession.fs, "/releases/current",
);

const plan = createSyncPlan({
  id: "release-mirror",
  diff,
  source: { provider: "sftp", rootPath: "/dist" },
  destination: { provider: "s3", rootPath: "/releases/current" },
  deletePolicy: "mirror",
  conflictPolicy: "overwrite",
});

console.table(summarizeTransferPlan(plan));
```
