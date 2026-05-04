[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createInboxRoute

# Function: createInboxRoute()

```ts
function createInboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:119](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/conventions.ts#L119)

Creates a route that pulls files out of an inbox into a destination directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateInboxRouteOptions`](../interfaces/CreateInboxRouteOptions.md) | Inbox layout, destination endpoint, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
