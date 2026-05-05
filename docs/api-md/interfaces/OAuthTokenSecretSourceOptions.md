[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OAuthTokenSecretSourceOptions

# Interface: OAuthTokenSecretSourceOptions

Defined in: [src/profiles/OAuthTokenSource.ts:37](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/OAuthTokenSource.ts#L37)

Options accepted by [createOAuthTokenSecretSource](../functions/createOAuthTokenSecretSource.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="now"></a> `now?` | () => `number` | Clock used to evaluate expiry. Defaults to `Date.now`. | [src/profiles/OAuthTokenSource.ts:44](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/OAuthTokenSource.ts#L44) |
| <a id="skewms"></a> `skewMs?` | `number` | Safety margin (in milliseconds) subtracted from the token's expiry to trigger a refresh before the wire deadline. Defaults to `60_000` (60s). | [src/profiles/OAuthTokenSource.ts:42](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/OAuthTokenSource.ts#L42) |
