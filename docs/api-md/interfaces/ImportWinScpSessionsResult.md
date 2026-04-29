[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportWinScpSessionsResult

# Interface: ImportWinScpSessionsResult

Defined in: [src/profiles/importers/WinScpImporter.ts:27](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/WinScpImporter.ts#L27)

Result of [importWinScpSessions](../functions/importWinScpSessions.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sessions"></a> `sessions` | readonly [`WinScpSession`](WinScpSession.md)[] | Successfully mapped sessions. | [src/profiles/importers/WinScpImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/WinScpImporter.ts#L29) |
| <a id="skipped"></a> `skipped` | readonly \{ `folder`: readonly `string`[]; `fsProtocol?`: `number`; `name`: `string`; \}[] | Sessions skipped because their protocol is not supported. | [src/profiles/importers/WinScpImporter.ts:31](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/importers/WinScpImporter.ts#L31) |
