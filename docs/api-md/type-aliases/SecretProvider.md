[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => 
  | SecretValue
| Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

  \| [`SecretValue`](SecretValue.md)
  \| `Promise`\<[`SecretValue`](SecretValue.md)\>
