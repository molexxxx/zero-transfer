[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSystemTransferCheckpointStoreOptions

# Interface: FileSystemTransferCheckpointStoreOptions

Defined in: src/transfers/TransferCheckpointStore.ts:256

Options accepted by [createFileSystemTransferCheckpointStore](../functions/createFileSystemTransferCheckpointStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="directory"></a> `directory` | `string` | Directory under which checkpoint JSON files are written. Created recursively if it does not exist. Each transfer identity occupies a single file named after a SHA-256 hash of the key, so the directory is safe to share across many concurrent transfers. | src/transfers/TransferCheckpointStore.ts:263 |
| <a id="now"></a> `now?` | () => `number` | Clock override for deterministic tests. Defaults to `Date.now`. | src/transfers/TransferCheckpointStore.ts:273 |
| <a id="ttlms"></a> `ttlMs?` | `number` | Checkpoint time-to-live in milliseconds. Records older than this are deleted on load and treated as absent. Defaults to 7 days, matching the default lifecycle window for uncommitted S3 multipart uploads and Azure staged blocks - resuming after the remote side has expired its half of the state would fail anyway. | src/transfers/TransferCheckpointStore.ts:271 |
