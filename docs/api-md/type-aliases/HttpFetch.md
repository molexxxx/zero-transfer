[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpFetch

# Type Alias: HttpFetch

```ts
type HttpFetch = (input, init?) => Promise<Response>;
```

Defined in: [src/providers/web/httpInternals.ts:20](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/httpInternals.ts#L20)

Fetch implementation accepted by web-family providers.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `init?` | `RequestInit` |

## Returns

`Promise`\<`Response`\>
