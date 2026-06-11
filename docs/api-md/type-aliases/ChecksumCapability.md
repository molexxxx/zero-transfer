[**ZeroTransfer SDK v0.4.7**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
