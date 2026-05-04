[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createMemoryProviderFactory

# Function: createMemoryProviderFactory()

```ts
function createMemoryProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/memory/MemoryProvider.ts:83](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/memory/MemoryProvider.ts#L83)

Creates a provider factory backed by deterministic in-memory fixture entries.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MemoryProviderOptions`](../interfaces/MemoryProviderOptions.md) | Optional fixture entries to expose through the memory provider. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
