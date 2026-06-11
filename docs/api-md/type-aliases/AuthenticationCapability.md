[**ZeroTransfer SDK v0.4.7**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
