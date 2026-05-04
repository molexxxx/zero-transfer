[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolver

# Type Alias: ProviderTransferSessionResolver

```ts
type ProviderTransferSessionResolver = (input) => TransferSession | undefined;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/createProviderTransferExecutor.ts#L43)

Resolves the connected provider session that owns an endpoint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ProviderTransferSessionResolverInput`](../interfaces/ProviderTransferSessionResolverInput.md) |

## Returns

[`TransferSession`](../interfaces/TransferSession.md) \| `undefined`
