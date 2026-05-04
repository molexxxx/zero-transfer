[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticTimings

# Interface: ConnectionDiagnosticTimings

Defined in: [src/diagnostics/index.ts:36](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/diagnostics/index.ts#L36)

Per-step duration measurements collected by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectms"></a> `connectMs?` | `number` | Total time spent inside `client.connect`. | [src/diagnostics/index.ts:38](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/diagnostics/index.ts#L38) |
| <a id="disconnectms"></a> `disconnectMs?` | `number` | Time spent inside the optional `session.disconnect`. | [src/diagnostics/index.ts:42](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/diagnostics/index.ts#L42) |
| <a id="listms"></a> `listMs?` | `number` | Time spent inside the optional `fs.list` probe. | [src/diagnostics/index.ts:40](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/diagnostics/index.ts#L40) |
