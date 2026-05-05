[**ZeroTransfer SDK v0.4.5**](../README.md)

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
