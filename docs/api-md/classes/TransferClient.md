[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClient

# Class: TransferClient

Defined in: [src/core/TransferClient.ts:33](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L33)

Small provider-neutral client that owns provider lookup and connection setup.

## Constructors

### Constructor

```ts
new TransferClient(options?): TransferClient;
```

Defined in: [src/core/TransferClient.ts:44](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L44)

Creates a transfer client without opening any provider connections.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferClientOptions`](../interfaces/TransferClientOptions.md) | Optional registry, provider factories, and logger. |

#### Returns

`TransferClient`

## Methods

### connect()

```ts
connect(profile): Promise<TransferSession<unknown>>;
```

Defined in: [src/core/TransferClient.ts:93](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L93)

Opens a provider session using `profile.provider`, with `profile.protocol` as compatibility fallback.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Connection profile containing a provider or legacy protocol field. |

#### Returns

`Promise`\<[`TransferSession`](../interfaces/TransferSession.md)\<`unknown`\>\>

A connected provider session.

#### Throws

[ConfigurationError](ConfigurationError.md) When neither provider nor protocol is present.

***

### getCapabilities()

#### Call Signature

```ts
getCapabilities(): CapabilitySet[];
```

Defined in: [src/core/TransferClient.ts:75](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L75)

Lists all registered provider capability snapshots.

##### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)[]

#### Call Signature

```ts
getCapabilities(providerId): CapabilitySet;
```

Defined in: [src/core/TransferClient.ts:77](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L77)

Gets a specific provider capability snapshot.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) |

##### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)

***

### hasProvider()

```ts
hasProvider(providerId): boolean;
```

Defined in: [src/core/TransferClient.ts:70](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L70)

Checks whether this client can create sessions for a provider id.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to inspect. |

#### Returns

`boolean`

`true` when a provider factory is registered.

***

### registerProvider()

```ts
registerProvider(provider): this;
```

Defined in: [src/core/TransferClient.ts:59](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L59)

Registers a provider factory with this client's registry.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `provider` | [`ProviderFactory`](../interfaces/ProviderFactory.md) | Provider factory to register. |

#### Returns

`this`

This client for fluent setup.

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="registry"></a> `registry` | `readonly` | [`ProviderRegistry`](ProviderRegistry.md) | Provider registry used by this client. | [src/core/TransferClient.ts:35](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/TransferClient.ts#L35) |
