[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolver

# Type Alias: ProviderTransferSessionResolver

```ts
type ProviderTransferSessionResolver = (input) => TransferSession | undefined;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/createProviderTransferExecutor.ts#L43)

Resolves the connected provider session that owns an endpoint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ProviderTransferSessionResolverInput`](../interfaces/ProviderTransferSessionResolverInput.md) |

## Returns

[`TransferSession`](../interfaces/TransferSession.md) \| `undefined`
