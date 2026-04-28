[**ZeroTransfer SDK v0.1.0**](../README.md)

---

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
  | (string & {});
```

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
