[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpFetch

# Type Alias: HttpFetch

```ts
type HttpFetch = (input, init?) => Promise<Response>;
```

Defined in: [src/providers/web/httpInternals.ts:20](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/httpInternals.ts#L20)

Fetch implementation accepted by web-family providers.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `init?` | `RequestInit` |

## Returns

`Promise`\<`Response`\>
