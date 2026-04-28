[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / createOutboxRoute

# Function: createOutboxRoute()

```ts
function createOutboxRoute(options): MftRoute;
```

Defined in: [src/mft/conventions.ts:149](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L149)

Creates a route that drops files from a source endpoint into an outbox directory.

## Parameters

| Parameter | Type                                                                    | Description                                            |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `options` | [`CreateOutboxRouteOptions`](../interfaces/CreateOutboxRouteOptions.md) | Source endpoint, outbox layout, and optional metadata. |

## Returns

[`MftRoute`](../interfaces/MftRoute.md)

An [MftRoute](../interfaces/MftRoute.md) ready to register with [RouteRegistry](../classes/RouteRegistry.md).
