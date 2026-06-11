[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClient

# Class: TransferClient

Defined in: [src/core/TransferClient.ts:72](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L72)

Small provider-neutral client that owns provider lookup and connection setup.

## Constructors

### Constructor

```ts
new TransferClient(options?): TransferClient;
```

Defined in: [src/core/TransferClient.ts:86](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L86)

Creates a transfer client without opening any provider connections.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferClientOptions`](../interfaces/TransferClientOptions.md) | Optional registry, provider factories, logger, and execution defaults. |

#### Returns

`TransferClient`

## Methods

### connect()

```ts
connect(profile): Promise<TransferSession<unknown>>;
```

Defined in: [src/core/TransferClient.ts:138](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L138)

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

Defined in: [src/core/TransferClient.ts:120](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L120)

Lists all registered provider capability snapshots.

##### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)[]

#### Call Signature

```ts
getCapabilities(providerId): CapabilitySet;
```

Defined in: [src/core/TransferClient.ts:122](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L122)

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

Defined in: [src/core/TransferClient.ts:115](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L115)

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

Defined in: [src/core/TransferClient.ts:104](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L104)

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
| <a id="defaults"></a> `defaults?` | `readonly` | [`TransferClientDefaults`](../interfaces/TransferClientDefaults.md) | Execution defaults applied when call sites omit their own values. | [src/core/TransferClient.ts:77](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L77) |
| <a id="registry"></a> `registry` | `readonly` | [`ProviderRegistry`](ProviderRegistry.md) | Provider registry used by this client. | [src/core/TransferClient.ts:74](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L74) |
