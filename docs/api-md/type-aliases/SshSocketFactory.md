[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactory

# Type Alias: SshSocketFactory

```ts
type SshSocketFactory = (context) => Readable | Promise<Readable>;
```

Defined in: [src/types/public.ts:112](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L112)

Creates a preconnected socket-like stream for SSH sessions.

Use this hook for HTTP CONNECT, SOCKS, bastion, or custom tunnel integrations.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`SshSocketFactoryContext`](../interfaces/SshSocketFactoryContext.md) | Resolved SSH target information for the socket being opened. |

## Returns

`Readable` \| `Promise`\<`Readable`\>

Preconnected readable stream, or a promise for one, passed to ssh2's `sock` option.
