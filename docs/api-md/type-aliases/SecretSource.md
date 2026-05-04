[**ZeroTransfer SDK v0.3.0**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
