[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createHttpProviderFactory

# Function: createHttpProviderFactory()

```ts
function createHttpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/HttpProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/HttpProvider.ts#L69)

Creates a provider factory backed by HTTP(S) GET/HEAD.

## Parameters

| Parameter | Type                                                          | Description                      |
| --------- | ------------------------------------------------------------- | -------------------------------- |
| `options` | [`HttpProviderOptions`](../interfaces/HttpProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
