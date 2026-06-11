[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => 
  | SecretValue
| Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

  \| [`SecretValue`](SecretValue.md)
  \| `Promise`\<[`SecretValue`](SecretValue.md)\>
