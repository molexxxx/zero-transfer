[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createMemoryTransferCheckpointStore

# Function: createMemoryTransferCheckpointStore()

```ts
function createMemoryTransferCheckpointStore(options?): TransferCheckpointStore;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:228](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L228)

Creates an in-memory [TransferCheckpointStore](../interfaces/TransferCheckpointStore.md).

Suitable for in-process retry resume (the engine's retry policy re-enters
the executor with the store still populated) and for tests. Does not
survive process restarts - use
[createFileSystemTransferCheckpointStore](createFileSystemTransferCheckpointStore.md) for cross-process resume.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`MemoryTransferCheckpointStoreOptions`](../interfaces/MemoryTransferCheckpointStoreOptions.md) |

## Returns

[`TransferCheckpointStore`](../interfaces/TransferCheckpointStore.md)
