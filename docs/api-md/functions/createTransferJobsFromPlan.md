[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:123](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferPlan.ts#L123)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
