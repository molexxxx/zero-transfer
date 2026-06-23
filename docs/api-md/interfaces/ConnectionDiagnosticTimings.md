[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticTimings

# Interface: ConnectionDiagnosticTimings

Defined in: [src/diagnostics/index.ts:48](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/diagnostics/index.ts#L48)

Per-step duration measurements collected by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectms"></a> `connectMs?` | `number` | Total time spent inside `client.connect`. | [src/diagnostics/index.ts:50](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/diagnostics/index.ts#L50) |
| <a id="disconnectms"></a> `disconnectMs?` | `number` | Time spent inside the optional `session.disconnect`. | [src/diagnostics/index.ts:54](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/diagnostics/index.ts#L54) |
| <a id="listms"></a> `listMs?` | `number` | Time spent inside the optional `fs.list` probe. | [src/diagnostics/index.ts:52](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/diagnostics/index.ts#L52) |
