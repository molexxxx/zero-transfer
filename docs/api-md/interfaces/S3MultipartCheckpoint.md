[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartCheckpoint

# Interface: S3MultipartCheckpoint

Defined in: [src/providers/web/S3Provider.ts:115](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L115)

Persisted multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="parts"></a> `parts` | readonly [`S3MultipartPart`](S3MultipartPart.md)[] | Parts already accepted by S3, in upload order. | [src/providers/web/S3Provider.ts:118](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L118) |
| <a id="uploadid"></a> `uploadId` | `string` | - | [src/providers/web/S3Provider.ts:116](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L116) |
