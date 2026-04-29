[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importFileZillaSites

# Function: importFileZillaSites()

```ts
function importFileZillaSites(xml): ImportFileZillaSitesResult;
```

Defined in: [src/profiles/importers/FileZillaImporter.ts:43](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/profiles/importers/FileZillaImporter.ts#L43)

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
