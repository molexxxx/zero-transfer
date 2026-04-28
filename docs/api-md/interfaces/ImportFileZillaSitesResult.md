[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / ImportFileZillaSitesResult

# Interface: ImportFileZillaSitesResult

Defined in: [src/profiles/importers/FileZillaImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/importers/FileZillaImporter.ts#L29)

Result returned by [importFileZillaSites](../functions/importFileZillaSites.md).

## Properties

| Property                       | Type                                                                                     | Description                                                      | Defined in                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="sites"></a> `sites`     | readonly [`FileZillaSite`](FileZillaSite.md)[]                                           | Sites successfully mapped to a connection profile.               | [src/profiles/importers/FileZillaImporter.ts:31](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/importers/FileZillaImporter.ts#L31) |
| <a id="skipped"></a> `skipped` | readonly \{ `folder`: readonly `string`[]; `name`: `string`; `protocol?`: `number`; \}[] | Sites that were skipped because their protocol is not supported. | [src/profiles/importers/FileZillaImporter.ts:33](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/importers/FileZillaImporter.ts#L33) |
