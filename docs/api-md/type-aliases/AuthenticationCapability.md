[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / AuthenticationCapability

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

Defined in: [src/core/CapabilitySet.ts:9](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/core/CapabilitySet.ts#L9)

Authentication mechanisms a provider can advertise.
