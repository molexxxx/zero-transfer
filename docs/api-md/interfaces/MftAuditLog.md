[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftAuditLog

# Interface: MftAuditLog

Defined in: [src/mft/audit.ts:39](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/audit.ts#L39)

Append-only audit log surface.

## Methods

### list()

```ts
list(): Promise<readonly MftAuditEntry[]>;
```

Defined in: [src/mft/audit.ts:43](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/audit.ts#L43)

Returns recorded entries in insertion order.

#### Returns

`Promise`\<readonly [`MftAuditEntry`](MftAuditEntry.md)[]\>

***

### record()

```ts
record(entry): Promise<void>;
```

Defined in: [src/mft/audit.ts:41](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/audit.ts#L41)

Records a new audit entry.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`MftAuditEntry`](MftAuditEntry.md) |

#### Returns

`Promise`\<`void`\>
