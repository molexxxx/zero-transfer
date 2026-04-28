[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createMemoryProviderFactory

# Function: createMemoryProviderFactory()

```ts
function createMemoryProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/memory/MemoryProvider.ts:76](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/memory/MemoryProvider.ts#L76)

Creates a provider factory backed by deterministic in-memory fixture entries.

## Parameters

| Parameter | Type                                                              | Description                                                     |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `options` | [`MemoryProviderOptions`](../interfaces/MemoryProviderOptions.md) | Optional fixture entries to expose through the memory provider. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
