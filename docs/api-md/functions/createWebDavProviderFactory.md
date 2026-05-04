[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebDavProviderFactory

# Function: createWebDavProviderFactory()

```ts
function createWebDavProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/WebDavProvider.ts:70](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/WebDavProvider.ts#L70)

Creates a WebDAV provider factory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`WebDavProviderOptions`](../interfaces/WebDavProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
