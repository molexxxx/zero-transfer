[**ZeroTransfer SDK v0.1.5**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
