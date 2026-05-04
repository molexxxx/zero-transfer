[**ZeroTransfer SDK v0.3.0**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
