[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:123](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/transfers/TransferPlan.ts#L123)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
