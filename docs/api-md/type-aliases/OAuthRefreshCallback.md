[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthRefreshCallback

# Type Alias: OAuthRefreshCallback

```ts
type OAuthRefreshCallback = () => 
  | OAuthAccessToken
| Promise<OAuthAccessToken>;
```

Defined in: [src/profiles/OAuthTokenSource.ts:34](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/profiles/OAuthTokenSource.ts#L34)

Refresh callback invoked when no valid cached token is available.

## Returns

  \| [`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)
  \| `Promise`\<[`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)\>
