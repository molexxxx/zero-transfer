[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / serializeTransferPlan

# Function: serializeTransferPlan()

```ts
function serializeTransferPlan(plan): string;
```

Defined in: src/transfers/resumableBatch.ts:55

Serializes a transfer plan to JSON for persistence.

The output round-trips through [deserializeTransferPlan](deserializeTransferPlan.md), so a plan
written to disk before a batch starts can be reloaded to resume the batch
in a fresh process.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `plan` | [`TransferPlan`](../interfaces/TransferPlan.md) | Plan to serialize. |

## Returns

`string`

Stable JSON representation.
