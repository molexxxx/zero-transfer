[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpFetch

# Type Alias: HttpFetch

```ts
type HttpFetch = (input, init?) => Promise<Response>;
```

Defined in: [src/providers/web/httpInternals.ts:18](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/providers/web/httpInternals.ts#L18)

Fetch implementation accepted by web-family providers.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `init?` | `RequestInit` |

## Returns

`Promise`\<`Response`\>
