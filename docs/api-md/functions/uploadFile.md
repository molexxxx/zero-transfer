[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / uploadFile

# Function: uploadFile()

```ts
function uploadFile(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:54](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/client/operations.ts#L54)

Uploads a single local file to a remote endpoint.

## Parameters

| Parameter | Type                                                      | Description              |
| --------- | --------------------------------------------------------- | ------------------------ |
| `options` | [`UploadFileOptions`](../interfaces/UploadFileOptions.md) | Friendly upload options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.
