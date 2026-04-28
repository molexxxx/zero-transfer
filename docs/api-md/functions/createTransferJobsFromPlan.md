[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / createTransferJobsFromPlan

# Function: createTransferJobsFromPlan()

```ts
function createTransferJobsFromPlan(plan): TransferJob[];
```

Defined in: [src/transfers/TransferPlan.ts:123](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferPlan.ts#L123)

Converts executable plan steps into transfer jobs while preserving order.

## Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `plan`    | [`TransferPlan`](../interfaces/TransferPlan.md) |

## Returns

[`TransferJob`](../interfaces/TransferJob.md)[]
