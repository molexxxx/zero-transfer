[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / HttpFetch

# Type Alias: HttpFetch

```ts
type HttpFetch = (input, init?) => Promise<Response>;
```

Defined in: [src/providers/web/httpInternals.ts:18](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/httpInternals.ts#L18)

Fetch implementation accepted by web-family providers.

## Parameters

| Parameter | Type          |
| --------- | ------------- |
| `input`   | `string`      |
| `init?`   | `RequestInit` |

## Returns

`Promise`\<`Response`\>
