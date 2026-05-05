[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSyncPlan

# Function: createSyncPlan()

```ts
function createSyncPlan(options): TransferPlan;
```

Defined in: [src/sync/createSyncPlan.ts:109](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createSyncPlan.ts#L109)

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
