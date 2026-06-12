[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointStore

# Interface: TransferCheckpointStore

Defined in: [src/transfers/TransferCheckpointStore.ts:140](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L140)

Persistence contract for transfer checkpoints.

Implementations may be synchronous or asynchronous. `clear` is invoked when
a transfer completes successfully or a checkpoint is invalidated; it must
tolerate missing entries.

## Methods

### clear()

```ts
clear(key): void | Promise<void>;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:148](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L148)

Removes the checkpoint for a transfer identity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`TransferCheckpointKey`](TransferCheckpointKey.md) |

#### Returns

`void` \| `Promise`\<`void`\>

***

### load()

```ts
load(key): 
  | TransferCheckpointRecord
  | Promise<TransferCheckpointRecord | undefined>
  | undefined;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:142](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L142)

Loads the checkpoint for a transfer identity, or `undefined` when absent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`TransferCheckpointKey`](TransferCheckpointKey.md) |

#### Returns

  \| [`TransferCheckpointRecord`](TransferCheckpointRecord.md)
  \| `Promise`\<[`TransferCheckpointRecord`](TransferCheckpointRecord.md) \| `undefined`\>
  \| `undefined`

***

### save()

```ts
save(key, record): void | Promise<void>;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:146](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L146)

Persists the checkpoint for a transfer identity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`TransferCheckpointKey`](TransferCheckpointKey.md) |
| `record` | [`TransferCheckpointRecord`](TransferCheckpointRecord.md) |

#### Returns

`void` \| `Promise`\<`void`\>
