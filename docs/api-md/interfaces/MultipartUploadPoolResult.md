[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartUploadPoolResult

# Interface: MultipartUploadPoolResult\<TResult\>

Defined in: src/providers/web/multipartUploadPool.ts:168

Result of [runMultipartUploadPool](../functions/runMultipartUploadPool.md).

## Type Parameters

| Type Parameter |
| ------ |
| `TResult` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytesuploaded"></a> `bytesUploaded` | `number` | Total bytes uploaded by this run. | src/providers/web/multipartUploadPool.ts:172 |
| <a id="parts"></a> `parts` | [`MultipartUploadedPart`](MultipartUploadedPart.md)\<`TResult`\>[] | All uploaded parts sorted by part number. | src/providers/web/multipartUploadPool.ts:170 |
