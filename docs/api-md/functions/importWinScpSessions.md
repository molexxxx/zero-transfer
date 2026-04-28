[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / importWinScpSessions

# Function: importWinScpSessions()

```ts
function importWinScpSessions(ini): ImportWinScpSessionsResult;
```

Defined in: [src/profiles/importers/WinScpImporter.ts:41](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/importers/WinScpImporter.ts#L41)

Parses WinSCP `WinSCP.ini` text and returns generated profiles.

## Parameters

| Parameter | Type     | Description                                |
| --------- | -------- | ------------------------------------------ |
| `ini`     | `string` | Contents of the WinSCP configuration file. |

## Returns

[`ImportWinScpSessionsResult`](../interfaces/ImportWinScpSessionsResult.md)

Imported sessions and any skipped entries.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When no session sections are found.
