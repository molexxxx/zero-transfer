[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebDavProviderFactory

# Function: createWebDavProviderFactory()

```ts
function createWebDavProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/WebDavProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/web/WebDavProvider.ts#L70)

Creates a WebDAV provider factory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`WebDavProviderOptions`](../interfaces/WebDavProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
