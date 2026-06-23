[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runResumableBatch

# Function: runResumableBatch()

```ts
function runResumableBatch(options): Promise<ResumableBatchResult>;
```

Defined in: [src/transfers/resumableBatch.ts:325](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L325)

Executes a transfer plan as a resumable batch job.

Completed steps are persisted to the batch store as they finish; re-running
with the same plan and store skips them, so a crashed or aborted batch
resumes from the first incomplete step. When the executor is configured
with byte-level resume, a step interrupted mid-file continues from its
checkpoint as well. The batch state is cleared automatically once every
executable step has completed.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ResumableBatchOptions`](../interfaces/ResumableBatchOptions.md) |

## Returns

`Promise`\<[`ResumableBatchResult`](../interfaces/ResumableBatchResult.md)\>

## Example

```ts
import {
  createFileSystemTransferBatchStateStore,
  createFileSystemTransferCheckpointStore,
  createProviderTransferExecutor,
  deserializeTransferPlan,
  runResumableBatch,
  serializeTransferPlan,
} from "@zero-transfer/sdk";
import { readFile, writeFile } from "node:fs/promises";

// First run: persist the plan, then execute it.
await writeFile("./batch.plan.json", serializeTransferPlan(plan), "utf8");

// Every run (first or resumed) is the same call:
const result = await runResumableBatch({
  batchStore: createFileSystemTransferBatchStateStore({ directory: "./.zt-batches" }),
  concurrency: 4,
  executor: createProviderTransferExecutor({
    resolveSession,
    resume: {
      store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
    },
  }),
  plan: deserializeTransferPlan(await readFile("./batch.plan.json", "utf8")),
  retry: createDefaultRetryPolicy(),
});

console.log(result.complete ? "batch done" : `${result.remainingStepIds.length} steps left`);
```
