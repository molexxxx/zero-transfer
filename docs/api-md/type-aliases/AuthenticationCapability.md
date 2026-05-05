[**ZeroTransfer SDK v0.4.4**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
