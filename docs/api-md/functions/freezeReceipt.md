[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / freezeReceipt

# Function: freezeReceipt()

```ts
function freezeReceipt(receipt): Readonly<TransferReceipt>;
```

Defined in: [src/mft/audit.ts:127](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L127)

Returns a deeply frozen copy of a transfer receipt.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `receipt` | [`TransferReceipt`](../interfaces/TransferReceipt.md) | Receipt to freeze. |

## Returns

`Readonly`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Read-only copy safe to retain in audit records.
