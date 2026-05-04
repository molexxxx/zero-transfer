[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferPlan

# Function: createTransferPlan()

```ts
function createTransferPlan(input): TransferPlan;
```

Defined in: [src/transfers/TransferPlan.ts:102](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/TransferPlan.ts#L102)

Creates a transfer plan from dry-run planning input.

Plans are immutable, structured descriptions of intended work. Pair with
[createSyncPlan](createSyncPlan.md) or [createAtomicDeployPlan](createAtomicDeployPlan.md) for end-to-end
planning, or build steps by hand when you need full control. Pass the plan
to [createTransferJobsFromPlan](createTransferJobsFromPlan.md) to materialize executable jobs.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`TransferPlanInput`](../interfaces/TransferPlanInput.md) |

## Returns

[`TransferPlan`](../interfaces/TransferPlan.md)

## Example

```ts
import { createTransferPlan, summarizeTransferPlan } from "@zero-transfer/sdk";

const plan = createTransferPlan({
  id: "manual-batch",
  steps: [
    { action: "upload", source: "./a.bin", destination: "/lake/a.bin", expectedBytes: 1024 },
    { action: "upload", source: "./b.bin", destination: "/lake/b.bin", expectedBytes: 2048 },
  ],
});

console.table(summarizeTransferPlan(plan));
```
