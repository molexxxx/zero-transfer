[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticTimings

# Interface: ConnectionDiagnosticTimings

Defined in: [src/diagnostics/index.ts:48](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L48)

Per-step duration measurements collected by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectms"></a> `connectMs?` | `number` | Total time spent inside `client.connect`. | [src/diagnostics/index.ts:50](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L50) |
| <a id="disconnectms"></a> `disconnectMs?` | `number` | Time spent inside the optional `session.disconnect`. | [src/diagnostics/index.ts:54](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L54) |
| <a id="listms"></a> `listMs?` | `number` | Time spent inside the optional `fs.list` probe. | [src/diagnostics/index.ts:52](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L52) |
