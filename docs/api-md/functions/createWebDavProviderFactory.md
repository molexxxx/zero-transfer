[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebDavProviderFactory

# Function: createWebDavProviderFactory()

```ts
function createWebDavProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/WebDavProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/web/WebDavProvider.ts#L70)

Creates a WebDAV provider factory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`WebDavProviderOptions`](../interfaces/WebDavProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
