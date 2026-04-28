[**ZeroTransfer SDK v0.1.0**](../README.md)

---

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
  | (string & {});
```

Defined in: [src/core/CapabilitySet.ts:29](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/CapabilitySet.ts#L29)

Metadata fields a provider can preserve or report.
