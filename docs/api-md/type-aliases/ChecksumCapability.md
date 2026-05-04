[**ZeroTransfer SDK v0.3.1**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
