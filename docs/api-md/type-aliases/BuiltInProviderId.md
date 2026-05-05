[**ZeroTransfer SDK v0.4.6**](../README.md)

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

Defined in: [src/core/ProviderId.ts:14](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/core/ProviderId.ts#L14)

Provider ids reserved for first-party ZeroTransfer adapters.
