[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / copyBetween

# Function: copyBetween()

```ts
function copyBetween(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:110](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/client/operations.ts#L110)

Copies a file between two remote endpoints in a single call.

## Parameters

| Parameter | Type                                                        | Description            |
| --------- | ----------------------------------------------------------- | ---------------------- |
| `options` | [`CopyBetweenOptions`](../interfaces/CopyBetweenOptions.md) | Friendly copy options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.
