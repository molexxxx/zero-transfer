[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importWinScpSessions

# Function: importWinScpSessions()

```ts
function importWinScpSessions(ini): ImportWinScpSessionsResult;
```

Defined in: [src/profiles/importers/WinScpImporter.ts:41](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/profiles/importers/WinScpImporter.ts#L41)

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
