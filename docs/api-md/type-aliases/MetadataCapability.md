[**ZeroTransfer SDK v0.1.6**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:29](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/core/CapabilitySet.ts#L29)

Metadata fields a provider can preserve or report.
