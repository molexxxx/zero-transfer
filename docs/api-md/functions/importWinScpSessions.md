[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importWinScpSessions

# Function: importWinScpSessions()

```ts
function importWinScpSessions(ini): ImportWinScpSessionsResult;
```

Defined in: [src/profiles/importers/WinScpImporter.ts:41](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/profiles/importers/WinScpImporter.ts#L41)

Parses WinSCP `WinSCP.ini` text and returns generated profiles.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ini` | `string` | Contents of the WinSCP configuration file. |

## Returns

[`ImportWinScpSessionsResult`](../interfaces/ImportWinScpSessionsResult.md)

Imported sessions and any skipped entries.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When no session sections are found.
