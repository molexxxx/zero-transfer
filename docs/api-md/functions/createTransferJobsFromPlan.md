[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:161](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/transfers/TransferPlan.ts#L161)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
