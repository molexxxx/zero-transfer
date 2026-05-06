[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createInboxRoute

# Function: createInboxRoute()

```ts
function createInboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:119](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/mft/conventions.ts#L119)

Creates a route that pulls files out of an inbox into a destination directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateInboxRouteOptions`](../interfaces/CreateInboxRouteOptions.md) | Inbox layout, destination endpoint, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
