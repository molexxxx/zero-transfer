[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importWinScpSessions

# Function: importWinScpSessions()

```ts
function importWinScpSessions(ini): ImportWinScpSessionsResult;
```

Defined in: [src/profiles/importers/WinScpImporter.ts:41](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/profiles/importers/WinScpImporter.ts#L41)

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
