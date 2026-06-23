[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportWinScpSessionsResult

# Interface: ImportWinScpSessionsResult

Defined in: [src/profiles/importers/WinScpImporter.ts:27](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/WinScpImporter.ts#L27)

Result of [importWinScpSessions](../functions/importWinScpSessions.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sessions"></a> `sessions` | readonly [`WinScpSession`](WinScpSession.md)[] | Successfully mapped sessions. | [src/profiles/importers/WinScpImporter.ts:29](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/WinScpImporter.ts#L29) |
| <a id="skipped"></a> `skipped` | readonly \{ `folder`: readonly `string`[]; `fsProtocol?`: `number`; `name`: `string`; \}[] | Sessions skipped because their protocol is not supported. | [src/profiles/importers/WinScpImporter.ts:31](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/WinScpImporter.ts#L31) |
