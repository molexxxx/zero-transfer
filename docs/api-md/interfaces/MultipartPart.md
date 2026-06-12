[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartPart

# Interface: MultipartPart

Defined in: src/providers/web/multipartUploadPool.ts:25

One part cut from the source stream.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Absolute byte offset after the last byte of this part (exclusive). | src/providers/web/multipartUploadPool.ts:33 |
| <a id="bytes"></a> `bytes` | `Uint8Array` | Part payload. Exactly `partSizeBytes` long except for the final part. | src/providers/web/multipartUploadPool.ts:29 |
| <a id="bytestart"></a> `byteStart` | `number` | Absolute byte offset of the first byte of this part. | src/providers/web/multipartUploadPool.ts:31 |
| <a id="partnumber"></a> `partNumber` | `number` | One-based part number, assigned in cut order. | src/providers/web/multipartUploadPool.ts:27 |
