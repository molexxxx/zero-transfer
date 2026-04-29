[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOAuthTokenSecretSource

# Function: createOAuthTokenSecretSource()

```ts
function createOAuthTokenSecretSource(refresh, options?): SecretProvider;
```

Defined in: [src/profiles/OAuthTokenSource.ts:71](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/OAuthTokenSource.ts#L71)

Builds a [SecretProvider](../type-aliases/SecretProvider.md) that exchanges a refresh callback for
cached, auto-renewing access tokens.

The returned function can be passed directly as `profile.password` for any
provider that accepts bearer tokens (Dropbox, Google Drive, OneDrive, GCS,
Azure Blob via AAD).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `refresh` | [`OAuthRefreshCallback`](../type-aliases/OAuthRefreshCallback.md) |
| `options` | [`OAuthTokenSecretSourceOptions`](../interfaces/OAuthTokenSecretSourceOptions.md) |

## Returns

[`SecretProvider`](../type-aliases/SecretProvider.md)

## Example

```ts
const password = createOAuthTokenSecretSource(async () => {
  const res = await fetch("https://example.com/oauth/token", { ... });
  const body = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: body.access_token, expiresInSeconds: body.expires_in };
});
const session = await factory.create().connect({ host: "", protocol: "ftp", password });
```
