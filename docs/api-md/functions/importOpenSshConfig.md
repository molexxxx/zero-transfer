[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importOpenSshConfig

# Function: importOpenSshConfig()

```ts
function importOpenSshConfig(options): ImportOpenSshConfigResult;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:167](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/importers/OpenSshConfigImporter.ts#L167)

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
