[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createWebDavProviderFactory

# Function: createWebDavProviderFactory()

```ts
function createWebDavProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/WebDavProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/WebDavProvider.ts#L70)

Creates a WebDAV provider factory.

## Parameters

| Parameter | Type                                                              | Description                      |
| --------- | ----------------------------------------------------------------- | -------------------------------- |
| `options` | [`WebDavProviderOptions`](../interfaces/WebDavProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
