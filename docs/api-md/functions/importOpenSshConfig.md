[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importOpenSshConfig

# Function: importOpenSshConfig()

```ts
function importOpenSshConfig(options): ImportOpenSshConfigResult;
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:167](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L167)

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
