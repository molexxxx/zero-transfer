[**ZeroTransfer SDK v0.1.5**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
