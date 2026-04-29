[**ZeroTransfer SDK v0.1.1**](../README.md)

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

Defined in: [src/core/ProviderId.ts:14](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/core/ProviderId.ts#L14)

Provider ids reserved for first-party ZeroTransfer adapters.
