[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / downloadFile

# Function: downloadFile()

```ts
function downloadFile(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:82](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/client/operations.ts#L82)

Downloads a single remote file to a local path.

## Parameters

| Parameter | Type                                                          | Description                |
| --------- | ------------------------------------------------------------- | -------------------------- |
| `options` | [`DownloadFileOptions`](../interfaces/DownloadFileOptions.md) | Friendly download options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.
