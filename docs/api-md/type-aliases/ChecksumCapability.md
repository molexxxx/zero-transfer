[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / ChecksumCapability

# Type Alias: ChecksumCapability

```ts
type ChecksumCapability = "crc32" | "crc32c" | "etag" | "md5" | "sha1" | "sha256" | (string & {});
```

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
