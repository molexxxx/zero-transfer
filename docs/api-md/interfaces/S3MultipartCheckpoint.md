[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartCheckpoint

# Interface: S3MultipartCheckpoint

Defined in: [src/providers/web/S3Provider.ts:109](https://github.com/tonywied17/zero-transfer/blob/3d3b2aaf54158384a7e5d156ab1f42706eb1f6fb/src/providers/web/S3Provider.ts#L109)

Persisted multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="parts"></a> `parts` | readonly [`S3MultipartPart`](S3MultipartPart.md)[] | Parts already accepted by S3, in upload order. | [src/providers/web/S3Provider.ts:112](https://github.com/tonywied17/zero-transfer/blob/3d3b2aaf54158384a7e5d156ab1f42706eb1f6fb/src/providers/web/S3Provider.ts#L112) |
| <a id="uploadid"></a> `uploadId` | `string` | - | [src/providers/web/S3Provider.ts:110](https://github.com/tonywied17/zero-transfer/blob/3d3b2aaf54158384a7e5d156ab1f42706eb1f6fb/src/providers/web/S3Provider.ts#L110) |
