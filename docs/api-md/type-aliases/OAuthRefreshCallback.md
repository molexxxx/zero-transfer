[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthRefreshCallback

# Type Alias: OAuthRefreshCallback

```ts
type OAuthRefreshCallback = () => 
  | OAuthAccessToken
| Promise<OAuthAccessToken>;
```

Defined in: [src/profiles/OAuthTokenSource.ts:34](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/OAuthTokenSource.ts#L34)

Refresh callback invoked when no valid cached token is available.

## Returns

  \| [`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)
  \| `Promise`\<[`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)\>
