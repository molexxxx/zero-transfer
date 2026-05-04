[**ZeroTransfer SDK v0.3.1**](../README.md)

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
