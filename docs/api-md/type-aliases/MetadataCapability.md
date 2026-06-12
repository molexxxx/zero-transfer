[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MetadataCapability

# Type Alias: MetadataCapability

```ts
type MetadataCapability = 
  | "accessedAt"
  | "createdAt"
  | "group"
  | "mimeType"
  | "modifiedAt"
  | "owner"
  | "permissions"
  | "storageClass"
  | "symlinkTarget"
  | "tags"
  | "uniqueId"
  | string & {
};
```

Defined in: [src/core/CapabilitySet.ts:29](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/core/CapabilitySet.ts#L29)

Metadata fields a provider can preserve or report.
