[**ZeroTransfer SDK v0.4.3**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:19](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/CapabilitySet.ts#L19)

Checksum or integrity mechanisms a provider can advertise.
