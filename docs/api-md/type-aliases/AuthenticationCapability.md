[**ZeroTransfer SDK v0.3.0**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
