[**ZeroTransfer SDK v0.3.1**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
