[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / MetadataCapability

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
  | (string & {});
```

Defined in: [src/core/CapabilitySet.ts:29](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/core/CapabilitySet.ts#L29)

Metadata fields a provider can preserve or report.
