[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importFileZillaSites

# Function: importFileZillaSites()

```ts
function importFileZillaSites(xml): ImportFileZillaSitesResult;
```

Defined in: [src/profiles/importers/FileZillaImporter.ts:43](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/profiles/importers/FileZillaImporter.ts#L43)

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
