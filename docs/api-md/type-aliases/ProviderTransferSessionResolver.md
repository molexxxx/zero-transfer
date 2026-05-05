[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolver

# Type Alias: ProviderTransferSessionResolver

```ts
type ProviderTransferSessionResolver = (input) => TransferSession | undefined;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/transfers/createProviderTransferExecutor.ts#L43)

Resolves the connected provider session that owns an endpoint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ProviderTransferSessionResolverInput`](../interfaces/ProviderTransferSessionResolverInput.md) |

## Returns

[`TransferSession`](../interfaces/TransferSession.md) \| `undefined`
