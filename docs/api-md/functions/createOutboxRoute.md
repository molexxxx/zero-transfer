[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOutboxRoute

# Function: createOutboxRoute()

```ts
function createOutboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:149](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/conventions.ts#L149)

Creates a route that drops files from a source endpoint into an outbox directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateOutboxRouteOptions`](../interfaces/CreateOutboxRouteOptions.md) | Source endpoint, outbox layout, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
