[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SecretSource

# Type Alias: SecretSource

```ts
type SecretSource = 
  | SecretValue
  | SecretProvider
  | ValueSecretSource
  | EnvSecretSource
  | Base64EnvSecretSource
  | FileSecretSource;
```

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
