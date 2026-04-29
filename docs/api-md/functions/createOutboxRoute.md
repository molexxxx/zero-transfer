[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOutboxRoute

# Function: createOutboxRoute()

```ts
function createOutboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:149](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L149)

Creates a route that drops files from a source endpoint into an outbox directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateOutboxRouteOptions`](../interfaces/CreateOutboxRouteOptions.md) | Source endpoint, outbox layout, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
