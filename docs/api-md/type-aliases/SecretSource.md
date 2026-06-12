[**ZeroTransfer SDK v0.4.8**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
