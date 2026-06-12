[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SequentialPartReaderOptions

# Interface: SequentialPartReaderOptions

Defined in: [src/providers/web/multipartUploadPool.ts:46](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L46)

Options for [createSequentialPartReader](../functions/createSequentialPartReader.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="initialchunks"></a> `initialChunks?` | `Uint8Array`\<`ArrayBufferLike`\>[] | Leading bytes already pulled from the source (for example a single-shot-threshold probe) that must be re-slotted ahead of remaining source chunks. | [src/providers/web/multipartUploadPool.ts:56](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L56) |
| <a id="partsizebytes"></a> `partSizeBytes` | `number` | Bytes per part (final part may be smaller). | [src/providers/web/multipartUploadPool.ts:50](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L50) |
| <a id="source"></a> `source` | `AsyncIterable`\<`Uint8Array`\<`ArrayBufferLike`\>\> | Source byte stream. | [src/providers/web/multipartUploadPool.ts:48](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L48) |
| <a id="startoffset"></a> `startOffset?` | `number` | Absolute byte offset of the first part produced. Defaults to `0`. | [src/providers/web/multipartUploadPool.ts:60](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L60) |
| <a id="startpartnumber"></a> `startPartNumber?` | `number` | Part number assigned to the first part produced. Defaults to `1`. | [src/providers/web/multipartUploadPool.ts:58](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L58) |
