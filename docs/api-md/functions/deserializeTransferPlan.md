[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / deserializeTransferPlan

# Function: deserializeTransferPlan()

```ts
function deserializeTransferPlan(text): TransferPlan;
```

Defined in: [src/transfers/resumableBatch.ts:74](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L74)

Parses a plan produced by [serializeTransferPlan](serializeTransferPlan.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Serialized plan JSON. |

## Returns

[`TransferPlan`](../interfaces/TransferPlan.md)

The reconstructed plan.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input is not a serialized plan.
