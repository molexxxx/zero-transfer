[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartOptions

# Interface: S3MultipartOptions

Defined in: [src/providers/web/S3Provider.ts:81](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L81)

Multipart upload tuning for the S3 provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable multipart upload. **Defaults to `true`** so large objects stream in fixed-size parts instead of being buffered in memory before a single `PUT`. Payloads at or below [S3MultipartOptions.thresholdBytes](#thresholdbytes) still fall back to a single-shot `PUT` automatically. Set to `false` to force single-shot behaviour (e.g. when targeting an S3-compatible endpoint that does not support `CreateMultipartUpload`). Single-shot uploads stream with `UNSIGNED-PAYLOAD` signing when the total size is known; S3 requires a `Content-Length` up front, so unknown-size payloads are buffered entirely in memory on this path. | [src/providers/web/S3Provider.ts:93](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L93) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:97](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L97) |
| <a id="resumestore"></a> `resumeStore?` | [`S3MultipartResumeStore`](S3MultipartResumeStore.md) | Optional persistent store enabling cross-process resume of incomplete multipart uploads. When provided, in-flight `uploadId` plus uploaded part etags are checkpointed after every part; on retry the upload reuses the stored state and skips the bytes already transferred. | [src/providers/web/S3Provider.ts:104](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L104) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:95](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L95) |
