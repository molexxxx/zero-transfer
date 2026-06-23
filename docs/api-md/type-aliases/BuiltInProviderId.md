[**ZeroTransfer SDK v0.5.0**](../README.md)

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

Defined in: [src/core/ProviderId.ts:14](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/ProviderId.ts#L14)

Provider ids reserved for first-party ZeroTransfer adapters.
