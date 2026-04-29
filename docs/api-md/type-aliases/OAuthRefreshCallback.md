[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthRefreshCallback

# Type Alias: OAuthRefreshCallback

```ts
type OAuthRefreshCallback = () => 
  | OAuthAccessToken
| Promise<OAuthAccessToken>;
```

Defined in: [src/profiles/OAuthTokenSource.ts:34](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/profiles/OAuthTokenSource.ts#L34)

Refresh callback invoked when no valid cached token is available.

## Returns

  \| [`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)
  \| `Promise`\<[`OAuthAccessToken`](../interfaces/OAuthAccessToken.md)\>
