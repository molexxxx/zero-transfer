[**ZeroTransfer SDK v0.4.6**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:29](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/core/CapabilitySet.ts#L29)

Metadata fields a provider can preserve or report.
