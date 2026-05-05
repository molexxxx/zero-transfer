[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ChecksumCapability

# Type Alias: ChecksumCapability

```ts
type ChecksumCapability = 
  | "crc32"
  | "crc32c"
  | "etag"
  | "md5"
  | "sha1"
  | "sha256"
  | string & {
};
```

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
