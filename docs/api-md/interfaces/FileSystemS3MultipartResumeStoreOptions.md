[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSystemS3MultipartResumeStoreOptions

# Interface: FileSystemS3MultipartResumeStoreOptions

Defined in: [src/providers/web/S3Provider.ts:178](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L178)

Options for [createFileSystemS3MultipartResumeStore](../functions/createFileSystemS3MultipartResumeStore.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="directory"></a> `directory` | `string` | Directory under which checkpoint JSON files are written. Created recursively if it does not exist. Each upload occupies a single file named after a SHA-256 hash of the resume key, so the directory is safe to share across many concurrent uploads. | [src/providers/web/S3Provider.ts:185](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L185) |
