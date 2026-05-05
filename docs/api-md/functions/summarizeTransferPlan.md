[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeTransferPlan

# Function: summarizeTransferPlan()

```ts
function summarizeTransferPlan(plan): TransferPlanSummary;
```

Defined in: [src/transfers/TransferPlan.ts:135](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferPlan.ts#L135)

Summarizes a transfer plan for diagnostics, previews, and tests.

Returns aggregate counts (total / executable / skipped / destructive),
total expected bytes, and a per-action histogram. Useful for printing a
one-line plan summary before executing or for asserting plan shape in
tests.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferPlanSummary`](../interfaces/TransferPlanSummary.md)

## Example

```ts
import { summarizeTransferPlan } from "@zero-transfer/sdk";

const summary = summarizeTransferPlan(plan);
console.log(`${summary.executableSteps} steps, ${summary.totalExpectedBytes} bytes total`);
console.log("Actions:", summary.actions);
```
