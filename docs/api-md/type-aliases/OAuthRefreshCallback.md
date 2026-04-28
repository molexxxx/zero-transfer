[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / OAuthRefreshCallback

# Type Alias: OAuthRefreshCallback

```ts
type OAuthRefreshCallback = () => OAuthAccessToken | Promise<OAuthAccessToken>;
```

Defined in: [src/profiles/OAuthTokenSource.ts:34](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/OAuthTokenSource.ts#L34)

Refresh callback invoked when no valid cached token is available.

## Returns

\| [`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)
\| `Promise`\<[`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)\>
