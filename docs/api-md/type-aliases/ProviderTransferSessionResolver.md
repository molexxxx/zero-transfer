[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolver

# Type Alias: ProviderTransferSessionResolver

```ts
type ProviderTransferSessionResolver = (input) => TransferSession | undefined;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/createProviderTransferExecutor.ts#L43)

Resolves the connected provider session that owns an endpoint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ProviderTransferSessionResolverInput`](../interfaces/ProviderTransferSessionResolverInput.md) |

## Returns

[`TransferSession`](../interfaces/TransferSession.md) \| `undefined`
