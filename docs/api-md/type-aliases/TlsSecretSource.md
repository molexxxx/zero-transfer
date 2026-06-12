[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TlsSecretSource

# Type Alias: TlsSecretSource

```ts
type TlsSecretSource = SecretSource | SecretSource[];
```

Defined in: [src/types/public.ts:81](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L81)

TLS material source accepted by certificate-aware connection profiles.

A single source is used for most fields; `ca` may use an array to preserve an
ordered certificate authority bundle.
