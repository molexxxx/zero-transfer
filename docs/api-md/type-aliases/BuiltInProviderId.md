[**ZeroTransfer SDK v0.1.6**](../README.md)

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

Defined in: [src/core/ProviderId.ts:14](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/core/ProviderId.ts#L14)

Provider ids reserved for first-party ZeroTransfer adapters.
