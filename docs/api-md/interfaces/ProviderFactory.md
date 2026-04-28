[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ProviderFactory

# Interface: ProviderFactory\<TProvider\>

Defined in: [src/providers/ProviderFactory.ts:11](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/ProviderFactory.ts#L11)

Factory registered with [ProviderRegistry](../classes/ProviderRegistry.md) to create providers on demand.

## Type Parameters

| Type Parameter                                                  | Default type                              |
| --------------------------------------------------------------- | ----------------------------------------- |
| `TProvider` _extends_ [`TransferProvider`](TransferProvider.md) | [`TransferProvider`](TransferProvider.md) |

## Properties

| Property                                 | Type                                          | Description                                                         | Defined in                                                                                                                                                            |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="capabilities"></a> `capabilities` | [`CapabilitySet`](CapabilitySet.md)           | Capability snapshot available without opening a network connection. | [src/providers/ProviderFactory.ts:15](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/ProviderFactory.ts#L15) |
| <a id="id"></a> `id`                     | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id created by this factory.                                | [src/providers/ProviderFactory.ts:13](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/ProviderFactory.ts#L13) |

## Methods

### create()

```ts
create(): TProvider;
```

Defined in: [src/providers/ProviderFactory.ts:17](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/ProviderFactory.ts#L17)

Creates an isolated provider instance for a connection attempt.

#### Returns

`TProvider`
