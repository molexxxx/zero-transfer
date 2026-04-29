[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => 
  | SecretValue
| Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

  \| [`SecretValue`](SecretValue.md)
  \| `Promise`\<[`SecretValue`](SecretValue.md)\>
