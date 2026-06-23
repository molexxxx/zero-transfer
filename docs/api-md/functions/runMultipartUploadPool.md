[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runMultipartUploadPool

# Function: runMultipartUploadPool()

```ts
function runMultipartUploadPool<TResult>(options): Promise<MultipartUploadPoolResult<TResult>>;
```

Defined in: [src/providers/web/multipartUploadPool.ts:190](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L190)

Uploads parts from a reader with bounded concurrency.

Workers race on the shared reader (which serializes cutting), upload their
parts, and record results. The first failure stops all issuance, waits for
in-flight uploads to settle, and rethrows; remaining workers observe the
failure and stop pulling new parts.

Finalization order is the caller's job: the returned parts are sorted by
`partNumber` (never completion order), ready for `CompleteMultipartUpload`
/ `Put Block List`.

## Type Parameters

| Type Parameter |
| ------ |
| `TResult` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MultipartUploadPoolOptions`](../interfaces/MultipartUploadPoolOptions.md)\<`TResult`\> | Reader, concurrency, part uploader, and commit observer. |

## Returns

`Promise`\<[`MultipartUploadPoolResult`](../interfaces/MultipartUploadPoolResult.md)\<`TResult`\>\>

Uploaded parts (part-number order) and total bytes uploaded.
