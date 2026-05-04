[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / negotiateSshAlgorithms

# Function: negotiateSshAlgorithms()

```ts
function negotiateSshAlgorithms(client, server): NegotiatedSshAlgorithms;
```

Defined in: [src/protocols/ssh/transport/SshAlgorithmNegotiation.ts:69](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshAlgorithmNegotiation.ts#L69)

Intersects client and server algorithm lists using SSH's client-priority selection model.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md) |
| `server` | [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md) |

## Returns

[`NegotiatedSshAlgorithms`](../interfaces/NegotiatedSshAlgorithms.md)
