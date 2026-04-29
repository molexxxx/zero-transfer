[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartOptions

# Interface: S3MultipartOptions

Defined in: [src/providers/web/S3Provider.ts:69](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/S3Provider.ts#L69)

Multipart upload tuning for the S3 provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable multipart upload. Defaults to `false`. | [src/providers/web/S3Provider.ts:71](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/S3Provider.ts#L71) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:75](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/S3Provider.ts#L75) |
| <a id="resumestore"></a> `resumeStore?` | [`S3MultipartResumeStore`](S3MultipartResumeStore.md) | Optional persistent store enabling cross-process resume of incomplete multipart uploads. When provided, in-flight `uploadId` plus uploaded part etags are checkpointed after every part; on retry the upload reuses the stored state and skips the bytes already transferred. | [src/providers/web/S3Provider.ts:82](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/S3Provider.ts#L82) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:73](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/S3Provider.ts#L73) |
