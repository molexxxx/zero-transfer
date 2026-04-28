[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ImportOpenSshConfigOptions

# Interface: ImportOpenSshConfigOptions

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:139](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/importers/OpenSshConfigImporter.ts#L139)

Options accepted by [importOpenSshConfig](../functions/importOpenSshConfig.md).

## Properties

| Property                        | Type                                                     | Description                                                                       | Defined in                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="alias"></a> `alias`      | `string`                                                 | Host alias to import.                                                             | [src/profiles/importers/OpenSshConfigImporter.ts:145](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/importers/OpenSshConfigImporter.ts#L145) |
| <a id="entries"></a> `entries?` | readonly [`OpenSshConfigEntry`](OpenSshConfigEntry.md)[] | Pre-parsed entries from [parseOpenSshConfig](../functions/parseOpenSshConfig.md). | [src/profiles/importers/OpenSshConfigImporter.ts:143](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/importers/OpenSshConfigImporter.ts#L143) |
| <a id="text"></a> `text?`       | `string`                                                 | Raw `ssh_config` text. Either this or [entries](#entries) must be provided.       | [src/profiles/importers/OpenSshConfigImporter.ts:141](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/importers/OpenSshConfigImporter.ts#L141) |
