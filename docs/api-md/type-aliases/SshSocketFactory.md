[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactory

# Type Alias: SshSocketFactory

```ts
type SshSocketFactory = (context) => Readable | Promise<Readable>;
```

Defined in: [src/types/public.ts:131](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L131)

Creates a preconnected socket-like stream for SSH sessions.

Use this hook for HTTP CONNECT, SOCKS, bastion, or custom tunnel integrations.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`SshSocketFactoryContext`](../interfaces/SshSocketFactoryContext.md) | Resolved SSH target information for the socket being opened. |

## Returns

`Readable` \| `Promise`\<`Readable`\>

Preconnected readable stream, or a promise for one, passed to the SSH adapter socket option.
