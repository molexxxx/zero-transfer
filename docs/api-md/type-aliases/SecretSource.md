[**ZeroTransfer SDK v0.1.0**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
