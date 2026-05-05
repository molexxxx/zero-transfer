[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftAuditLog

# Interface: MftAuditLog

Defined in: [src/mft/audit.ts:39](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/audit.ts#L39)

Append-only audit log surface.

## Methods

### list()

```ts
list(): Promise<readonly MftAuditEntry[]>;
```

Defined in: [src/mft/audit.ts:43](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/audit.ts#L43)

Returns recorded entries in insertion order.

#### Returns

`Promise`\<readonly [`MftAuditEntry`](MftAuditEntry.md)[]\>

***

### record()

```ts
record(entry): Promise<void>;
```

Defined in: [src/mft/audit.ts:41](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/audit.ts#L41)

Records a new audit entry.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`MftAuditEntry`](MftAuditEntry.md) |

#### Returns

`Promise`\<`void`\>
