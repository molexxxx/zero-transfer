[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveConnectionProfileSecrets

# Function: resolveConnectionProfileSecrets()

```ts
function resolveConnectionProfileSecrets(profile, options?): Promise<ResolvedConnectionProfile>;
```

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:61](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/resolveConnectionProfileSecrets.ts#L61)

Resolves credential and TLS material secret sources without mutating the original profile.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Profile containing optional secret sources. |
| `options` | [`ResolveSecretOptions`](../interfaces/ResolveSecretOptions.md) | Optional env and file-reader overrides. |

## Returns

`Promise`\<[`ResolvedConnectionProfile`](../interfaces/ResolvedConnectionProfile.md)\>

Profile copy with username, password, TLS material, and SSH material resolved when present.
