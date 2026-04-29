[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / composeAuditLogs

# Function: composeAuditLogs()

```ts
function composeAuditLogs(...logs): MftAuditLog;
```

Defined in: [src/mft/audit.ts:104](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/audit.ts#L104)

Combines multiple audit logs into a single fan-out log.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`logs` | readonly [`MftAuditLog`](../interfaces/MftAuditLog.md)[] | Logs that should each receive every recorded entry. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

A composite log whose `record` writes to all targets in order and
         whose `list` returns the first non-empty result.
