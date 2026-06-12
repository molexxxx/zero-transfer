[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveOpenSshHost

# Function: resolveOpenSshHost()

```ts
function resolveOpenSshHost(entries, alias): ResolvedOpenSshHost;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:99](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/profiles/importers/OpenSshConfigImporter.ts#L99)

Resolves the merged option set for an OpenSSH host alias.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `entries` | readonly [`OpenSshConfigEntry`](../interfaces/OpenSshConfigEntry.md)[] | Parsed entries from [parseOpenSshConfig](parseOpenSshConfig.md). |
| `alias` | `string` | Host alias to resolve. |

## Returns

[`ResolvedOpenSshHost`](../interfaces/ResolvedOpenSshHost.md)

Merged directive set with the matching entries.
