[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveConnectionProfileSecrets

# Function: resolveConnectionProfileSecrets()

```ts
function resolveConnectionProfileSecrets(profile, options?): Promise<ResolvedConnectionProfile>;
```

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:61](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/profiles/resolveConnectionProfileSecrets.ts#L61)

Resolves credential and TLS material secret sources without mutating the original profile.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Profile containing optional secret sources. |
| `options` | [`ResolveSecretOptions`](../interfaces/ResolveSecretOptions.md) | Optional env and file-reader overrides. |

## Returns

`Promise`\<[`ResolvedConnectionProfile`](../interfaces/ResolvedConnectionProfile.md)\>

Profile copy with username, password, TLS material, and SSH material resolved when present.
