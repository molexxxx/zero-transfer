[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:161](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferPlan.ts#L161)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
