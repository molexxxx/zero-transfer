[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => 
  | SecretValue
| Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

  \| [`SecretValue`](SecretValue.md)
  \| `Promise`\<[`SecretValue`](SecretValue.md)\>
