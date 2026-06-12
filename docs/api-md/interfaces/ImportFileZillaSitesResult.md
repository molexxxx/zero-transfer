[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportFileZillaSitesResult

# Interface: ImportFileZillaSitesResult

Defined in: [src/profiles/importers/FileZillaImporter.ts:35](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/FileZillaImporter.ts#L35)

Result returned by [importFileZillaSites](../functions/importFileZillaSites.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sites"></a> `sites` | readonly [`FileZillaSite`](FileZillaSite.md)[] | Sites successfully mapped to a connection profile. | [src/profiles/importers/FileZillaImporter.ts:37](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/FileZillaImporter.ts#L37) |
| <a id="skipped"></a> `skipped` | readonly \{ `folder`: readonly `string`[]; `name`: `string`; `protocol?`: `number`; \}[] | Sites that were skipped because their protocol is not supported. | [src/profiles/importers/FileZillaImporter.ts:39](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/FileZillaImporter.ts#L39) |
