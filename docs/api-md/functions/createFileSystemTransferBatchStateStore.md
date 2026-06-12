[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFileSystemTransferBatchStateStore

# Function: createFileSystemTransferBatchStateStore()

```ts
function createFileSystemTransferBatchStateStore(options): TransferBatchStateStore;
```

Defined in: [src/transfers/resumableBatch.ts:179](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/resumableBatch.ts#L179)

File-system backed [TransferBatchStateStore](../interfaces/TransferBatchStateStore.md) that survives process
restarts, enabling cross-process batch resume.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`FileSystemTransferBatchStateStoreOptions`](../interfaces/FileSystemTransferBatchStateStoreOptions.md) |

## Returns

[`TransferBatchStateStore`](../interfaces/TransferBatchStateStore.md)
