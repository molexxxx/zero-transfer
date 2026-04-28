[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createTransferClient

# Function: createTransferClient()

```ts
function createTransferClient(options?): TransferClient;
```

Defined in: [src/core/createTransferClient.ts:14](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/core/createTransferClient.ts#L14)

Creates a provider-neutral transfer client.

## Parameters

| Parameter | Type                                                              | Description                                        |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `options` | [`TransferClientOptions`](../interfaces/TransferClientOptions.md) | Optional registry, provider factories, and logger. |

## Returns

[`TransferClient`](../classes/TransferClient.md)

A disconnected [TransferClient](../classes/TransferClient.md) instance.
