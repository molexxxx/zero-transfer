[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / freezeReceipt

# Function: freezeReceipt()

```ts
function freezeReceipt(receipt): Readonly<TransferReceipt>;
```

Defined in: [src/mft/audit.ts:127](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/audit.ts#L127)

Returns a deeply frozen copy of a transfer receipt.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `receipt` | [`TransferReceipt`](../interfaces/TransferReceipt.md) | Receipt to freeze. |

## Returns

`Readonly`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Read-only copy safe to retain in audit records.
