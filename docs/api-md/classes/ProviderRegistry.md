[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / ProviderRegistry

# Class: ProviderRegistry

Defined in: [src/core/ProviderRegistry.ts:12](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L12)

Mutable registry of provider factories available to a transfer client.

## Constructors

### Constructor

```ts
new ProviderRegistry(providers?): ProviderRegistry;
```

Defined in: [src/core/ProviderRegistry.ts:20](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L20)

Creates a registry and optionally seeds it with provider factories.

#### Parameters

| Parameter   | Type                                                                                                                                                                                                 | Default value | Description                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------- |
| `providers` | `Iterable`\<[`ProviderFactory`](../interfaces/ProviderFactory.md)\<[`TransferProvider`](../interfaces/TransferProvider.md)\<[`TransferSession`](../interfaces/TransferSession.md)\<`unknown`\>\>\>\> | `[]`          | Provider factories to register immediately. |

#### Returns

`ProviderRegistry`

## Methods

### get()

```ts
get(providerId):
  | ProviderFactory<TransferProvider<TransferSession<unknown>>>
  | undefined;
```

Defined in: [src/core/ProviderRegistry.ts:72](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L72)

Gets a provider factory when registered.

#### Parameters

| Parameter    | Type                                          | Description              |
| ------------ | --------------------------------------------- | ------------------------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to retrieve. |

#### Returns

\| [`ProviderFactory`](../interfaces/ProviderFactory.md)\<[`TransferProvider`](../interfaces/TransferProvider.md)\<[`TransferSession`](../interfaces/TransferSession.md)\<`unknown`\>\>\>
\| `undefined`

The provider factory, or `undefined` when missing.

---

### getCapabilities()

```ts
getCapabilities(providerId): CapabilitySet | undefined;
```

Defined in: [src/core/ProviderRegistry.ts:103](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L103)

Gets a provider capability snapshot when registered.

#### Parameters

| Parameter    | Type                                          | Description             |
| ------------ | --------------------------------------------- | ----------------------- |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to inspect. |

#### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md) \| `undefined`

Capability snapshot, or `undefined` when missing.

---

### has()

```ts
has(providerId): boolean;
```

Defined in: [src/core/ProviderRegistry.ts:62](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L62)

Checks whether a provider id is registered.

#### Parameters

| Parameter    | Type                                          | Description             |
| ------------ | --------------------------------------------- | ----------------------- |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to inspect. |

#### Returns

`boolean`

`true` when a provider factory exists.

---

### list()

```ts
list(): ProviderFactory<TransferProvider<TransferSession<unknown>>>[];
```

Defined in: [src/core/ProviderRegistry.ts:123](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L123)

Lists registered provider factories in insertion order.

#### Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)\<[`TransferProvider`](../interfaces/TransferProvider.md)\<[`TransferSession`](../interfaces/TransferSession.md)\<`unknown`\>\>\>[]

Registered provider factories.

---

### listCapabilities()

```ts
listCapabilities(): CapabilitySet[];
```

Defined in: [src/core/ProviderRegistry.ts:132](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L132)

Lists registered provider capabilities in insertion order.

#### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)[]

Capability snapshots for every registered provider.

---

### register()

```ts
register(provider): this;
```

Defined in: [src/core/ProviderRegistry.ts:33](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L33)

Registers a provider factory.

#### Parameters

| Parameter  | Type                                                  | Description              |
| ---------- | ----------------------------------------------------- | ------------------------ |
| `provider` | [`ProviderFactory`](../interfaces/ProviderFactory.md) | Provider factory to add. |

#### Returns

`this`

This registry for fluent setup.

#### Throws

[ConfigurationError](ConfigurationError.md) When a provider id is registered twice.

---

### require()

```ts
require(providerId): ProviderFactory;
```

Defined in: [src/core/ProviderRegistry.ts:83](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L83)

Gets a registered provider factory or throws a typed SDK error.

#### Parameters

| Parameter    | Type                                          | Description              |
| ------------ | --------------------------------------------- | ------------------------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to retrieve. |

#### Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

The registered provider factory.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When no provider has been registered.

---

### requireCapabilities()

```ts
requireCapabilities(providerId): CapabilitySet;
```

Defined in: [src/core/ProviderRegistry.ts:114](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L114)

Gets a provider capability snapshot or throws a typed SDK error.

#### Parameters

| Parameter    | Type                                          | Description             |
| ------------ | --------------------------------------------- | ----------------------- |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to inspect. |

#### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)

Capability snapshot for the registered provider.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When no provider has been registered.

---

### unregister()

```ts
unregister(providerId): boolean;
```

Defined in: [src/core/ProviderRegistry.ts:52](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderRegistry.ts#L52)

Removes a provider factory from the registry.

#### Parameters

| Parameter    | Type                                          | Description            |
| ------------ | --------------------------------------------- | ---------------------- |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to remove. |

#### Returns

`boolean`

`true` when a provider was removed.
