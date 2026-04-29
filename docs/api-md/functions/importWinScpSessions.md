[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / importWinScpSessions

# Function: importWinScpSessions()

```ts
function importWinScpSessions(ini): ImportWinScpSessionsResult;
```

Defined in: [src/profiles/importers/WinScpImporter.ts:41](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/profiles/importers/WinScpImporter.ts#L41)

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
