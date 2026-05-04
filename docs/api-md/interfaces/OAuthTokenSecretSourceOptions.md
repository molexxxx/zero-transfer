[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthTokenSecretSourceOptions

# Interface: OAuthTokenSecretSourceOptions

Defined in: [src/profiles/OAuthTokenSource.ts:37](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L37)

Options accepted by [createOAuthTokenSecretSource](../functions/createOAuthTokenSecretSource.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="now"></a> `now?` | () => `number` | Clock used to evaluate expiry. Defaults to `Date.now`. | [src/profiles/OAuthTokenSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L44) |
| <a id="skewms"></a> `skewMs?` | `number` | Safety margin (in milliseconds) subtracted from the token's expiry to trigger a refresh before the wire deadline. Defaults to `60_000` (60s). | [src/profiles/OAuthTokenSource.ts:42](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/OAuthTokenSource.ts#L42) |
