[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:123](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferPlan.ts#L123)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `plan`    | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
