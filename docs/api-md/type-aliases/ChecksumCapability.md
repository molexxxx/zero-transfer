[**ZeroTransfer SDK v0.4.4**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
