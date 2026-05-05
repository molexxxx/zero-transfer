[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartCheckpoint

# Interface: S3MultipartCheckpoint

Defined in: [src/providers/web/S3Provider.ts:109](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/providers/web/S3Provider.ts#L109)

Persisted multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="parts"></a> `parts` | readonly [`S3MultipartPart`](S3MultipartPart.md)[] | Parts already accepted by S3, in upload order. | [src/providers/web/S3Provider.ts:112](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/providers/web/S3Provider.ts#L112) |
| <a id="uploadid"></a> `uploadId` | `string` | - | [src/providers/web/S3Provider.ts:110](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/providers/web/S3Provider.ts#L110) |
