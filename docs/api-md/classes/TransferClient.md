[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClient

# Class: TransferClient

Defined in: [src/core/TransferClient.ts:82](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L82)

Small provider-neutral client that owns provider lookup and connection setup.

## Constructors

### Constructor

```ts
new TransferClient(options?): TransferClient;
```

Defined in: [src/core/TransferClient.ts:96](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L96)

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

Defined in: [src/core/TransferClient.ts:148](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L148)

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

Defined in: [src/core/TransferClient.ts:130](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L130)

Lists all registered provider capability snapshots.

##### Returns

[`CapabilitySet`](../interfaces/CapabilitySet.md)[]

#### Call Signature

```ts
getCapabilities(providerId): CapabilitySet;
```

Defined in: [src/core/TransferClient.ts:132](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L132)

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

Defined in: [src/core/TransferClient.ts:125](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L125)

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

Defined in: [src/core/TransferClient.ts:114](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L114)

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
| <a id="defaults"></a> `defaults?` | `readonly` | [`TransferClientDefaults`](../interfaces/TransferClientDefaults.md) | Execution defaults applied when call sites omit their own values. | [src/core/TransferClient.ts:87](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L87) |
| <a id="registry"></a> `registry` | `readonly` | [`ProviderRegistry`](ProviderRegistry.md) | Provider registry used by this client. | [src/core/TransferClient.ts:84](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/TransferClient.ts#L84) |
