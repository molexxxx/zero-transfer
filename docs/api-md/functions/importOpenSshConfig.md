[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importOpenSshConfig

# Function: importOpenSshConfig()

```ts
function importOpenSshConfig(options): ImportOpenSshConfigResult;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:167](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/profiles/importers/OpenSshConfigImporter.ts#L167)

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
