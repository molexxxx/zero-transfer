[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / freezeReceipt

# Function: freezeReceipt()

```ts
function freezeReceipt(receipt): Readonly<TransferReceipt>;
```

Defined in: [src/mft/audit.ts:127](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L127)

Returns a deeply frozen copy of a transfer receipt.

## Parameters

| Parameter | Type                                                  | Description        |
| --------- | ----------------------------------------------------- | ------------------ |
| `receipt` | [`TransferReceipt`](../interfaces/TransferReceipt.md) | Receipt to freeze. |

## Returns

`Readonly`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Read-only copy safe to retain in audit records.
