[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importFileZillaSites

# Function: importFileZillaSites()

```ts
function importFileZillaSites(xml): ImportFileZillaSitesResult;
```

Defined in: [src/profiles/importers/FileZillaImporter.ts:49](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/FileZillaImporter.ts#L49)

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
