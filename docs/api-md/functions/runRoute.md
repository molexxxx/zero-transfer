[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / runRoute

# Function: runRoute()

```ts
function runRoute(options): Promise<TransferReceipt>;
```

Defined in: [src/mft/runRoute.ts:64](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/runRoute.ts#L64)

Executes an MFT route as a single transfer through the supplied client.

## Parameters

| Parameter | Type                                                  | Description                                           |
| --------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `options` | [`RunRouteOptions`](../interfaces/RunRouteOptions.md) | Client, route, and optional engine/abort/retry hooks. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the route is disabled.
