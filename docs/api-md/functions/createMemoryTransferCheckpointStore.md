[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createMemoryTransferCheckpointStore

# Function: createMemoryTransferCheckpointStore()

```ts
function createMemoryTransferCheckpointStore(options?): TransferCheckpointStore;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:228](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L228)

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
