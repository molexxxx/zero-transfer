[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / InMemoryAuditLog

# Class: InMemoryAuditLog

Defined in: [src/mft/audit.ts:47](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L47)

In-memory implementation of [MftAuditLog](../interfaces/MftAuditLog.md).

## Implements

- [`MftAuditLog`](../interfaces/MftAuditLog.md)

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: [src/mft/audit.ts:67](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L67)

Number of currently recorded entries.

##### Returns

`number`

## Constructors

### Constructor

```ts
new InMemoryAuditLog(): InMemoryAuditLog;
```

#### Returns

`InMemoryAuditLog`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: [src/mft/audit.ts:62](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L62)

Drops all recorded entries.

#### Returns

`void`

***

### list()

```ts
list(): Promise<readonly MftAuditEntry[]>;
```

Defined in: [src/mft/audit.ts:57](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L57)

Returns recorded entries in insertion order.

#### Returns

`Promise`\<readonly [`MftAuditEntry`](../interfaces/MftAuditEntry.md)[]\>

#### Implementation of

[`MftAuditLog`](../interfaces/MftAuditLog.md).[`list`](../interfaces/MftAuditLog.md#list)

***

### record()

```ts
record(entry): Promise<void>;
```

Defined in: [src/mft/audit.ts:51](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L51)

Records a new audit entry.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`MftAuditEntry`](../interfaces/MftAuditEntry.md) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MftAuditLog`](../interfaces/MftAuditLog.md).[`record`](../interfaces/MftAuditLog.md#record)
