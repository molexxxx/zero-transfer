[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSystemS3MultipartResumeStoreOptions

# Interface: FileSystemS3MultipartResumeStoreOptions

Defined in: [src/providers/web/S3Provider.ts:154](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/providers/web/S3Provider.ts#L154)

Options for [createFileSystemS3MultipartResumeStore](../functions/createFileSystemS3MultipartResumeStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="directory"></a> `directory` | `string` | Directory under which checkpoint JSON files are written. Created recursively if it does not exist. Each upload occupies a single file named after a SHA-256 hash of the resume key, so the directory is safe to share across many concurrent uploads. | [src/providers/web/S3Provider.ts:161](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/providers/web/S3Provider.ts#L161) |
