[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createJsonlAuditLog

# Function: createJsonlAuditLog()

```ts
function createJsonlAuditLog(writer): MftAuditLog;
```

Defined in: [src/mft/audit.ts:88](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/audit.ts#L88)

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
