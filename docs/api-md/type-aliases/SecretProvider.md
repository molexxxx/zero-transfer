[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => 
  | SecretValue
| Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/tonywied17/zero-transfer/blob/3d3b2aaf54158384a7e5d156ab1f42706eb1f6fb/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

  \| [`SecretValue`](SecretValue.md)
  \| `Promise`\<[`SecretValue`](SecretValue.md)\>
