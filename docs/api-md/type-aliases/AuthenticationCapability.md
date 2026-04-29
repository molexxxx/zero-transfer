[**ZeroTransfer SDK v0.1.2**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
