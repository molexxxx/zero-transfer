[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createLocalProviderFactory

# Function: createLocalProviderFactory()

```ts
function createLocalProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/local/LocalProvider.ts:72](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/local/LocalProvider.ts#L72)

Creates a provider factory backed by the local filesystem.

## Parameters

| Parameter | Type                                                            | Description                                                 |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| `options` | [`LocalProviderOptions`](../interfaces/LocalProviderOptions.md) | Optional local root path exposed through provider sessions. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
