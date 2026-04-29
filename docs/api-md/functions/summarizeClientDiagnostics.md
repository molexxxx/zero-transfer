[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeClientDiagnostics

# Function: summarizeClientDiagnostics()

```ts
function summarizeClientDiagnostics(client): ClientDiagnostics;
```

Defined in: [src/diagnostics/index.ts:28](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/diagnostics/index.ts#L28)

Returns a redaction-safe snapshot of the providers registered with a client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client to inspect. |

## Returns

[`ClientDiagnostics`](../interfaces/ClientDiagnostics.md)

Provider id and capability snapshot tuples.
