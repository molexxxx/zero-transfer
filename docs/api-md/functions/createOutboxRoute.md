[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOutboxRoute

# Function: createOutboxRoute()

```ts
function createOutboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:149](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/conventions.ts#L149)

Creates a route that drops files from a source endpoint into an outbox directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateOutboxRouteOptions`](../interfaces/CreateOutboxRouteOptions.md) | Source endpoint, outbox layout, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
