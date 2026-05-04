[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeClientDiagnostics

# Function: summarizeClientDiagnostics()

```ts
function summarizeClientDiagnostics(client): ClientDiagnostics;
```

Defined in: [src/diagnostics/index.ts:28](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/diagnostics/index.ts#L28)

Returns a redaction-safe snapshot of the providers registered with a client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client to inspect. |

## Returns

[`ClientDiagnostics`](../interfaces/ClientDiagnostics.md)

Provider id and capability snapshot tuples.
