[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactory

# Type Alias: SshSocketFactory

```ts
type SshSocketFactory = (context) => Readable | Promise<Readable>;
```

Defined in: [src/types/public.ts:129](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L129)

Creates a preconnected socket-like stream for SSH sessions.

Use this hook for HTTP CONNECT, SOCKS, bastion, or custom tunnel integrations.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`SshSocketFactoryContext`](../interfaces/SshSocketFactoryContext.md) | Resolved SSH target information for the socket being opened. |

## Returns

`Readable` \| `Promise`\<`Readable`\>

Preconnected readable stream, or a promise for one, passed to the SSH adapter socket option.
