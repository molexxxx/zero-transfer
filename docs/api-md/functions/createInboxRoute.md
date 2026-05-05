[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createInboxRoute

# Function: createInboxRoute()

```ts
function createInboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:119](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/conventions.ts#L119)

Creates a route that pulls files out of an inbox into a destination directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateInboxRouteOptions`](../interfaces/CreateInboxRouteOptions.md) | Inbox layout, destination endpoint, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
