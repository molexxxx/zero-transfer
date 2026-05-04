[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportOpenSshConfigOptions

# Interface: ImportOpenSshConfigOptions

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:139](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L139)

Options accepted by [importOpenSshConfig](../functions/importOpenSshConfig.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="alias"></a> `alias` | `string` | Host alias to import. | [src/profiles/importers/OpenSshConfigImporter.ts:145](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L145) |
| <a id="entries"></a> `entries?` | readonly [`OpenSshConfigEntry`](OpenSshConfigEntry.md)[] | Pre-parsed entries from [parseOpenSshConfig](../functions/parseOpenSshConfig.md). | [src/profiles/importers/OpenSshConfigImporter.ts:143](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L143) |
| <a id="text"></a> `text?` | `string` | Raw `ssh_config` text. Either this or [entries](#entries) must be provided. | [src/profiles/importers/OpenSshConfigImporter.ts:141](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L141) |
