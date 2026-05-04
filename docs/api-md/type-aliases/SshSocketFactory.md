[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactory

# Type Alias: SshSocketFactory

```ts
type SshSocketFactory = (context) => Readable | Promise<Readable>;
```

Defined in: [src/types/public.ts:131](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/types/public.ts#L131)

Creates a preconnected socket-like stream for SSH sessions.

Use this hook for HTTP CONNECT, SOCKS, bastion, or custom tunnel integrations.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`SshSocketFactoryContext`](../interfaces/SshSocketFactoryContext.md) | Resolved SSH target information for the socket being opened. |

## Returns

`Readable` \| `Promise`\<`Readable`\>

Preconnected readable stream, or a promise for one, passed to the SSH adapter socket option.
