[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / composeAuditLogs

# Function: composeAuditLogs()

```ts
function composeAuditLogs(...logs): MftAuditLog;
```

Defined in: [src/mft/audit.ts:104](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L104)

Combines multiple audit logs into a single fan-out log.

## Parameters

| Parameter | Type                                                     | Description                                         |
| --------- | -------------------------------------------------------- | --------------------------------------------------- |
| ...`logs` | readonly [`MftAuditLog`](../interfaces/MftAuditLog.md)[] | Logs that should each receive every recorded entry. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

A composite log whose `record` writes to all targets in order and
whose `list` returns the first non-empty result.
