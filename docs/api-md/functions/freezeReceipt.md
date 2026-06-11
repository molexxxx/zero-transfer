[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / freezeReceipt

# Function: freezeReceipt()

```ts
function freezeReceipt(receipt): Readonly<TransferReceipt>;
```

Defined in: [src/mft/audit.ts:127](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/audit.ts#L127)

Returns a deeply frozen copy of a transfer receipt.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `receipt` | [`TransferReceipt`](../interfaces/TransferReceipt.md) | Receipt to freeze. |

## Returns

`Readonly`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Read-only copy safe to retain in audit records.
