[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthAccessToken

# Interface: OAuthAccessToken

Defined in: [src/profiles/OAuthTokenSource.ts:21](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L21)

Token material returned by [OAuthRefreshCallback](../type-aliases/OAuthRefreshCallback.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="accesstoken"></a> `accessToken` | `string` | Access token value. Required. | [src/profiles/OAuthTokenSource.ts:23](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L23) |
| <a id="expiresat"></a> `expiresAt?` | `Date` | Absolute expiry. Wins over `expiresInSeconds` when both are provided. | [src/profiles/OAuthTokenSource.ts:30](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L30) |
| <a id="expiresinseconds"></a> `expiresInSeconds?` | `number` | Lifetime in seconds (`expires_in`-style). When provided, the helper caches the token until `now + (expiresInSeconds - skewSeconds)`. | [src/profiles/OAuthTokenSource.ts:28](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L28) |
