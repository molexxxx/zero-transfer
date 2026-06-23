[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartUploadedPart

# Interface: MultipartUploadedPart\<TResult\>

Defined in: [src/providers/web/multipartUploadPool.ts:127](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L127)

A finished part paired with the uploader's result.

## Type Parameters

| Type Parameter |
| ------ |
| `TResult` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Absolute byte offset after the last byte of this part (exclusive). | [src/providers/web/multipartUploadPool.ts:133](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L133) |
| <a id="bytestart"></a> `byteStart` | `number` | Absolute byte offset of the first byte of this part. | [src/providers/web/multipartUploadPool.ts:131](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L131) |
| <a id="partnumber"></a> `partNumber` | `number` | Part metadata (payload bytes are released after upload). | [src/providers/web/multipartUploadPool.ts:129](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L129) |
| <a id="result"></a> `result` | `TResult` | Value returned by the part uploader (ETag, block id, ...). | [src/providers/web/multipartUploadPool.ts:135](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L135) |
