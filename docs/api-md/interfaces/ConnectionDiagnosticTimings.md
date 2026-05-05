[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticTimings

# Interface: ConnectionDiagnosticTimings

Defined in: [src/diagnostics/index.ts:48](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L48)

Per-step duration measurements collected by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectms"></a> `connectMs?` | `number` | Total time spent inside `client.connect`. | [src/diagnostics/index.ts:50](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L50) |
| <a id="disconnectms"></a> `disconnectMs?` | `number` | Time spent inside the optional `session.disconnect`. | [src/diagnostics/index.ts:54](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L54) |
| <a id="listms"></a> `listMs?` | `number` | Time spent inside the optional `fs.list` probe. | [src/diagnostics/index.ts:52](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L52) |
