[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveConnectionProfileSecrets

# Function: resolveConnectionProfileSecrets()

```ts
function resolveConnectionProfileSecrets(profile, options?): Promise<ResolvedConnectionProfile>;
```

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:61](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/profiles/resolveConnectionProfileSecrets.ts#L61)

Resolves credential and TLS material secret sources without mutating the original profile.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Profile containing optional secret sources. |
| `options` | [`ResolveSecretOptions`](../interfaces/ResolveSecretOptions.md) | Optional env and file-reader overrides. |

## Returns

`Promise`\<[`ResolvedConnectionProfile`](../interfaces/ResolvedConnectionProfile.md)\>

Profile copy with username, password, TLS material, and SSH material resolved when present.
