[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / composeAuditLogs

# Function: composeAuditLogs()

```ts
function composeAuditLogs(...logs): MftAuditLog;
```

Defined in: [src/mft/audit.ts:104](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/audit.ts#L104)

Combines multiple audit logs into a single fan-out log.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`logs` | readonly [`MftAuditLog`](../interfaces/MftAuditLog.md)[] | Logs that should each receive every recorded entry. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

A composite log whose `record` writes to all targets in order and
         whose `list` returns the first non-empty result.
