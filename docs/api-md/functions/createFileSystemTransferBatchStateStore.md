[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFileSystemTransferBatchStateStore

# Function: createFileSystemTransferBatchStateStore()

```ts
function createFileSystemTransferBatchStateStore(options): TransferBatchStateStore;
```

Defined in: [src/transfers/resumableBatch.ts:179](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L179)

File-system backed [TransferBatchStateStore](../interfaces/TransferBatchStateStore.md) that survives process
restarts, enabling cross-process batch resume.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`FileSystemTransferBatchStateStoreOptions`](../interfaces/FileSystemTransferBatchStateStoreOptions.md) |

## Returns

[`TransferBatchStateStore`](../interfaces/TransferBatchStateStore.md)
