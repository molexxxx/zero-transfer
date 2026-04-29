[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportFileZillaSitesResult

# Interface: ImportFileZillaSitesResult

Defined in: [src/profiles/importers/FileZillaImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/FileZillaImporter.ts#L29)

Result returned by [importFileZillaSites](../functions/importFileZillaSites.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sites"></a> `sites` | readonly [`FileZillaSite`](FileZillaSite.md)[] | Sites successfully mapped to a connection profile. | [src/profiles/importers/FileZillaImporter.ts:31](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/FileZillaImporter.ts#L31) |
| <a id="skipped"></a> `skipped` | readonly \{ `folder`: readonly `string`[]; `name`: `string`; `protocol?`: `number`; \}[] | Sites that were skipped because their protocol is not supported. | [src/profiles/importers/FileZillaImporter.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/FileZillaImporter.ts#L33) |
