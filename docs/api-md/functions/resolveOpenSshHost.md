[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveOpenSshHost

# Function: resolveOpenSshHost()

```ts
function resolveOpenSshHost(entries, alias): ResolvedOpenSshHost;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:99](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L99)

Resolves the merged option set for an OpenSSH host alias.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `entries` | readonly [`OpenSshConfigEntry`](../interfaces/OpenSshConfigEntry.md)[] | Parsed entries from [parseOpenSshConfig](parseOpenSshConfig.md). |
| `alias` | `string` | Host alias to resolve. |

## Returns

[`ResolvedOpenSshHost`](../interfaces/ResolvedOpenSshHost.md)

Merged directive set with the matching entries.
