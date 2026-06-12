[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartUploadPoolResult

# Interface: MultipartUploadPoolResult\<TResult\>

Defined in: [src/providers/web/multipartUploadPool.ts:168](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L168)

Result of [runMultipartUploadPool](../functions/runMultipartUploadPool.md).

## Type Parameters

| Type Parameter |
| ------ |
| `TResult` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytesuploaded"></a> `bytesUploaded` | `number` | Total bytes uploaded by this run. | [src/providers/web/multipartUploadPool.ts:172](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L172) |
| <a id="parts"></a> `parts` | [`MultipartUploadedPart`](MultipartUploadedPart.md)\<`TResult`\>[] | All uploaded parts sorted by part number. | [src/providers/web/multipartUploadPool.ts:170](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L170) |
