[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / resolveOpenSshHost

# Function: resolveOpenSshHost()

```ts
function resolveOpenSshHost(entries, alias): ResolvedOpenSshHost;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:99](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/importers/OpenSshConfigImporter.ts#L99)

Resolves the merged option set for an OpenSSH host alias.

## Parameters

| Parameter | Type                                                                   | Description                                                      |
| --------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `entries` | readonly [`OpenSshConfigEntry`](../interfaces/OpenSshConfigEntry.md)[] | Parsed entries from [parseOpenSshConfig](parseOpenSshConfig.md). |
| `alias`   | `string`                                                               | Host alias to resolve.                                           |

## Returns

[`ResolvedOpenSshHost`](../interfaces/ResolvedOpenSshHost.md)

Merged directive set with the matching entries.
