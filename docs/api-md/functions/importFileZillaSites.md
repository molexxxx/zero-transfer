[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importFileZillaSites

# Function: importFileZillaSites()

```ts
function importFileZillaSites(xml): ImportFileZillaSitesResult;
```

Defined in: [src/profiles/importers/FileZillaImporter.ts:43](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/FileZillaImporter.ts#L43)

Parses FileZilla `sitemanager.xml` text and returns generated profiles.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `xml` | `string` | Contents of `sitemanager.xml`. |

## Returns

[`ImportFileZillaSitesResult`](../interfaces/ImportFileZillaSitesResult.md)

Imported sites and any skipped entries.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the XML root cannot be located.
