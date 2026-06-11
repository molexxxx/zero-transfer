[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BuiltInProviderId

# Type Alias: BuiltInProviderId

```ts
type BuiltInProviderId = 
  | ClassicProviderId
  | "memory"
  | "local"
  | "http"
  | "https"
  | "webdav"
  | "s3"
  | "azure-blob"
  | "gcs"
  | "dropbox"
  | "google-drive"
  | "one-drive";
```

Defined in: [src/core/ProviderId.ts:14](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/ProviderId.ts#L14)

Provider ids reserved for first-party ZeroTransfer adapters.
