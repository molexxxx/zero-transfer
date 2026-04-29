[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createHttpProviderFactory

# Function: createHttpProviderFactory()

```ts
function createHttpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/HttpProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/web/HttpProvider.ts#L69)

Creates a provider factory backed by HTTP(S) GET/HEAD.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`HttpProviderOptions`](../interfaces/HttpProviderOptions.md) | Optional provider configuration. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
