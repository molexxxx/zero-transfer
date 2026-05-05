[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFileSystemS3MultipartResumeStore

# Function: createFileSystemS3MultipartResumeStore()

```ts
function createFileSystemS3MultipartResumeStore(options): S3MultipartResumeStore;
```

Defined in: [src/providers/web/S3Provider.ts:188](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L188)

File-system backed [S3MultipartResumeStore](../interfaces/S3MultipartResumeStore.md) that survives process
restarts. Each in-flight multipart upload is checkpointed to a single
JSON file in `options.directory` after every part. On retry the upload
reuses the stored `uploadId` and skips parts that S3 has already
accepted.

The implementation writes atomically (`<file>.tmp` then `rename`) so a
crash mid-write cannot leave a corrupt checkpoint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`FileSystemS3MultipartResumeStoreOptions`](../interfaces/FileSystemS3MultipartResumeStoreOptions.md) |

## Returns

[`S3MultipartResumeStore`](../interfaces/S3MultipartResumeStore.md)

## Example

```ts
import { createFileSystemS3MultipartResumeStore, createS3ProviderFactory }
  from "@zero-transfer/sdk";

const resumeStore = createFileSystemS3MultipartResumeStore({
  directory: "./.zt-s3-resume",
});

const factory = createS3ProviderFactory({
  multipart: { enabled: true, resumeStore },
});
```
