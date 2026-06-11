[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpFetch

# Type Alias: HttpFetch

```ts
type HttpFetch = (input, init?) => Promise<Response>;
```

Defined in: [src/providers/web/httpInternals.ts:20](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/httpInternals.ts#L20)

Fetch implementation accepted by web-family providers.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `init?` | `RequestInit` |

## Returns

`Promise`\<`Response`\>
