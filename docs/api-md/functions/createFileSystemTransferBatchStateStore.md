[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFileSystemTransferBatchStateStore

# Function: createFileSystemTransferBatchStateStore()

```ts
function createFileSystemTransferBatchStateStore(options): TransferBatchStateStore;
```

Defined in: src/transfers/resumableBatch.ts:179

File-system backed [TransferBatchStateStore](../interfaces/TransferBatchStateStore.md) that survives process
restarts, enabling cross-process batch resume.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`FileSystemTransferBatchStateStoreOptions`](../interfaces/FileSystemTransferBatchStateStoreOptions.md) |

## Returns

[`TransferBatchStateStore`](../interfaces/TransferBatchStateStore.md)
