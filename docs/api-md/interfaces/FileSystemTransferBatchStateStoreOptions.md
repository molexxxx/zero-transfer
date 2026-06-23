[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSystemTransferBatchStateStoreOptions

# Interface: FileSystemTransferBatchStateStoreOptions

Defined in: [src/transfers/resumableBatch.ts:166](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L166)

Options accepted by [createFileSystemTransferBatchStateStore](../functions/createFileSystemTransferBatchStateStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="directory"></a> `directory` | `string` | Directory under which batch-state JSON files are written. Created recursively if it does not exist; one file per plan id (SHA-256 hashed filename), written atomically with mode `0600`. | [src/transfers/resumableBatch.ts:172](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L172) |
