[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SecretSource

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

Defined in: [src/profiles/SecretSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/SecretSource.ts#L44)

Secret source accepted by profile credential fields.
