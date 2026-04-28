[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / summarizeClientDiagnostics

# Function: summarizeClientDiagnostics()

```ts
function summarizeClientDiagnostics(client): ClientDiagnostics;
```

Defined in: [src/diagnostics/index.ts:28](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L28)

Returns a redaction-safe snapshot of the providers registered with a client.

## Parameters

| Parameter | Type                                             | Description                 |
| --------- | ------------------------------------------------ | --------------------------- |
| `client`  | [`TransferClient`](../classes/TransferClient.md) | Transfer client to inspect. |

## Returns

[`ClientDiagnostics`](../interfaces/ClientDiagnostics.md)

Provider id and capability snapshot tuples.
