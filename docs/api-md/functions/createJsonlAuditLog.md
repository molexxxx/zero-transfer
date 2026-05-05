[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createJsonlAuditLog

# Function: createJsonlAuditLog()

```ts
function createJsonlAuditLog(writer): MftAuditLog;
```

Defined in: [src/mft/audit.ts:88](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/audit.ts#L88)

Creates an audit log that streams records as newline-delimited JSON.

`list()` is not supported by the JSONL writer because the durable form is
append-only on disk. Callers that need to read back entries should pair the
JSONL log with an [InMemoryAuditLog](../classes/InMemoryAuditLog.md) via [composeAuditLogs](composeAuditLogs.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `writer` | [`JsonlWriter`](../interfaces/JsonlWriter.md) | Sink that receives one JSON line per record. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

A log that writes JSONL on every `record` call.
