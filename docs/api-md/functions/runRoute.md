[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runRoute

# Function: runRoute()

```ts
function runRoute(options): Promise<TransferReceipt>;
```

Defined in: [src/mft/runRoute.ts:64](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/runRoute.ts#L64)

Executes an MFT route as a single transfer through the supplied client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RunRouteOptions`](../interfaces/RunRouteOptions.md) | Client, route, and optional engine/abort/retry hooks. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the route is disabled.
