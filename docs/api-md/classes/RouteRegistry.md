[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RouteRegistry

# Class: RouteRegistry

Defined in: [src/mft/RouteRegistry.ts:13](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L13)

Mutable in-memory registry of MFT routes.

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: [src/mft/RouteRegistry.ts:115](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L115)

Returns the number of routes currently registered.

##### Returns

`number`

## Constructors

### Constructor

```ts
new RouteRegistry(routes?): RouteRegistry;
```

Defined in: [src/mft/RouteRegistry.ts:21](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L21)

Creates a registry and optionally seeds it with route definitions.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `routes` | `Iterable`\<[`MftRoute`](../interfaces/MftRoute.md)\> | `[]` | Routes to register immediately. |

#### Returns

`RouteRegistry`

## Methods

### get()

```ts
get(routeId): MftRoute | undefined;
```

Defined in: [src/mft/RouteRegistry.ts:80](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L80)

Gets a route definition when registered.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeId` | `string` | Route id to retrieve. |

#### Returns

[`MftRoute`](../interfaces/MftRoute.md) \| `undefined`

The route, or `undefined` when missing.

***

### has()

```ts
has(routeId): boolean;
```

Defined in: [src/mft/RouteRegistry.ts:70](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L70)

Checks whether a route id is registered.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeId` | `string` | Route id to inspect. |

#### Returns

`boolean`

`true` when a route exists.

***

### list()

```ts
list(): MftRoute[];
```

Defined in: [src/mft/RouteRegistry.ts:110](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L110)

Returns all registered routes in registration order.

#### Returns

[`MftRoute`](../interfaces/MftRoute.md)[]

Array of route definitions.

***

### register()

```ts
register(route): this;
```

Defined in: [src/mft/RouteRegistry.ts:34](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L34)

Registers a route definition.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `route` | [`MftRoute`](../interfaces/MftRoute.md) | Route to add. |

#### Returns

`this`

This registry for fluent setup.

#### Throws

[ConfigurationError](ConfigurationError.md) When the route id is already registered or empty.

***

### require()

```ts
require(routeId): MftRoute;
```

Defined in: [src/mft/RouteRegistry.ts:91](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L91)

Gets a route definition or throws a typed SDK error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeId` | `string` | Route id to retrieve. |

#### Returns

[`MftRoute`](../interfaces/MftRoute.md)

The registered route.

#### Throws

[ConfigurationError](ConfigurationError.md) When no route is registered under the id.

***

### unregister()

```ts
unregister(routeId): boolean;
```

Defined in: [src/mft/RouteRegistry.ts:60](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/RouteRegistry.ts#L60)

Removes a route from the registry.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeId` | `string` | Route id to remove. |

#### Returns

`boolean`

`true` when a route was removed.
