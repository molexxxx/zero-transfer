[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importOpenSshConfig

# Function: importOpenSshConfig()

```ts
function importOpenSshConfig(options): ImportOpenSshConfigResult;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:167](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/OpenSshConfigImporter.ts#L167)

Builds a [ConnectionProfile](../interfaces/ConnectionProfile.md) for the given SSH alias from `ssh_config` text or pre-parsed entries.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ImportOpenSshConfigOptions`](../interfaces/ImportOpenSshConfigOptions.md) | Import options. |

## Returns

[`ImportOpenSshConfigResult`](../interfaces/ImportOpenSshConfigResult.md)

Importer result with the generated profile and supporting metadata.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When neither text nor entries is supplied.
