[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / negotiateSshAlgorithms

# Function: negotiateSshAlgorithms()

```ts
function negotiateSshAlgorithms(client, server): NegotiatedSshAlgorithms;
```

Defined in: [src/protocols/ssh/transport/SshAlgorithmNegotiation.ts:69](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/protocols/ssh/transport/SshAlgorithmNegotiation.ts#L69)

Intersects client and server algorithm lists using SSH's client-priority selection model.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md) |
| `server` | [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md) |

## Returns

[`NegotiatedSshAlgorithms`](../interfaces/NegotiatedSshAlgorithms.md)
