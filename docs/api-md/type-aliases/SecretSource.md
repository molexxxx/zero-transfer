[**ZeroTransfer SDK v0.4.5**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
