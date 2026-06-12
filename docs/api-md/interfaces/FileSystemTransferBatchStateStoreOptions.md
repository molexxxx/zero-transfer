[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSystemTransferBatchStateStoreOptions

# Interface: FileSystemTransferBatchStateStoreOptions

Defined in: [src/transfers/resumableBatch.ts:166](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/resumableBatch.ts#L166)

Options accepted by [createFileSystemTransferBatchStateStore](../functions/createFileSystemTransferBatchStateStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="directory"></a> `directory` | `string` | Directory under which batch-state JSON files are written. Created recursively if it does not exist; one file per plan id (SHA-256 hashed filename), written atomically with mode `0600`. | [src/transfers/resumableBatch.ts:172](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/resumableBatch.ts#L172) |
