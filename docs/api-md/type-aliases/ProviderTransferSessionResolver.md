[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ProviderTransferSessionResolver

# Type Alias: ProviderTransferSessionResolver

```ts
type ProviderTransferSessionResolver = (input) => TransferSession | undefined;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/createProviderTransferExecutor.ts#L43)

Resolves the connected provider session that owns an endpoint.

## Parameters

| Parameter | Type                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------- |
| `input`   | [`ProviderTransferSessionResolverInput`](../interfaces/ProviderTransferSessionResolverInput.md) |

## Returns

[`TransferSession`](../interfaces/TransferSession.md) \| `undefined`
