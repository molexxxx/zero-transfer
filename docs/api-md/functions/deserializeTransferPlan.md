[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / deserializeTransferPlan

# Function: deserializeTransferPlan()

```ts
function deserializeTransferPlan(text): TransferPlan;
```

Defined in: [src/transfers/resumableBatch.ts:74](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/resumableBatch.ts#L74)

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
