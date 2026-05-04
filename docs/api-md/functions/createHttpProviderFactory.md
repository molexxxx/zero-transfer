[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createHttpProviderFactory

# Function: createHttpProviderFactory()

```ts
function createHttpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/HttpProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/HttpProvider.ts#L69)

Creates a provider factory backed by HTTP(S) GET/HEAD.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`HttpProviderOptions`](../interfaces/HttpProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
