[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createInboxRoute

# Function: createInboxRoute()

```ts
function createInboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:119](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L119)

Creates a route that pulls files out of an inbox into a destination directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateInboxRouteOptions`](../interfaces/CreateInboxRouteOptions.md) | Inbox layout, destination endpoint, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
