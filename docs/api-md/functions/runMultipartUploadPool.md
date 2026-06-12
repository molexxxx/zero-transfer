[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runMultipartUploadPool

# Function: runMultipartUploadPool()

```ts
function runMultipartUploadPool<TResult>(options): Promise<MultipartUploadPoolResult<TResult>>;
```

Defined in: [src/providers/web/multipartUploadPool.ts:190](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L190)

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
