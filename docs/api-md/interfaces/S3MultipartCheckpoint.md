[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartCheckpoint

# Interface: S3MultipartCheckpoint

Defined in: [src/providers/web/S3Provider.ts:133](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L133)

Persisted multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="parts"></a> `parts` | readonly [`S3MultipartPart`](S3MultipartPart.md)[] | Parts already accepted by S3, in upload order. | [src/providers/web/S3Provider.ts:136](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L136) |
| <a id="uploadid"></a> `uploadId` | `string` | - | [src/providers/web/S3Provider.ts:134](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L134) |
