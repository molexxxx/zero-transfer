[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / serializeTransferPlan

# Function: serializeTransferPlan()

```ts
function serializeTransferPlan(plan): string;
```

Defined in: [src/transfers/resumableBatch.ts:55](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L55)

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
