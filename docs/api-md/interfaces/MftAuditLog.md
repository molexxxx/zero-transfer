[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / MftAuditLog

# Interface: MftAuditLog

Defined in: [src/mft/audit.ts:39](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L39)

Append-only audit log surface.

## Methods

### list()

```ts
list(): Promise<readonly MftAuditEntry[]>;
```

Defined in: [src/mft/audit.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L43)

Returns recorded entries in insertion order.

#### Returns

`Promise`\<readonly [`MftAuditEntry`](MftAuditEntry.md)[]\>

---

### record()

```ts
record(entry): Promise<void>;
```

Defined in: [src/mft/audit.ts:41](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L41)

Records a new audit entry.

#### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `entry`   | [`MftAuditEntry`](MftAuditEntry.md) |

#### Returns

`Promise`\<`void`\>
