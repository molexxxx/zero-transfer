[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AuthenticationCapability

# Type Alias: AuthenticationCapability

```ts
type AuthenticationCapability = 
  | "anonymous"
  | "password"
  | "private-key"
  | "token"
  | "oauth"
  | "service-account"
  | string & {
};
```

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
