[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SecretProvider

# Type Alias: SecretProvider

```ts
type SecretProvider = () => SecretValue | Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:15](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/SecretSource.ts#L15)

Callback source used by applications to integrate vaults or credential brokers.

## Returns

\| [`SecretValue`](SecretValue.md)
\| `Promise`\<[`SecretValue`](SecretValue.md)\>
