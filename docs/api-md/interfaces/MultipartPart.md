[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartPart

# Interface: MultipartPart

Defined in: [src/providers/web/multipartUploadPool.ts:25](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L25)

One part cut from the source stream.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Absolute byte offset after the last byte of this part (exclusive). | [src/providers/web/multipartUploadPool.ts:33](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L33) |
| <a id="bytes"></a> `bytes` | `Uint8Array` | Part payload. Exactly `partSizeBytes` long except for the final part. | [src/providers/web/multipartUploadPool.ts:29](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L29) |
| <a id="bytestart"></a> `byteStart` | `number` | Absolute byte offset of the first byte of this part. | [src/providers/web/multipartUploadPool.ts:31](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L31) |
| <a id="partnumber"></a> `partNumber` | `number` | One-based part number, assigned in cut order. | [src/providers/web/multipartUploadPool.ts:27](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L27) |
