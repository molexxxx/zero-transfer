[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthRefreshCallback

# Type Alias: OAuthRefreshCallback

```ts
type OAuthRefreshCallback = () => 
  | OAuthAccessToken
| Promise<OAuthAccessToken>;
```

Defined in: [src/profiles/OAuthTokenSource.ts:34](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/profiles/OAuthTokenSource.ts#L34)

Refresh callback invoked when no valid cached token is available.

## Returns

  \| [`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)
  \| `Promise`\<[`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)\>
