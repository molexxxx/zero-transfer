[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TlsSecretSource

# Type Alias: TlsSecretSource

```ts
type TlsSecretSource = SecretSource | SecretSource[];
```

Defined in: [src/types/public.ts:82](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L82)

TLS material source accepted by certificate-aware connection profiles.

A single source is used for most fields; `ca` may use an array to preserve an
ordered certificate authority bundle.
