[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartOptions

# Interface: S3MultipartOptions

Defined in: [src/providers/web/S3Provider.ts:78](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L78)

Multipart upload tuning for the S3 provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable multipart upload. **Defaults to `true`** so large objects stream in fixed-size parts instead of being buffered in memory before a single `PUT`. Payloads at or below [S3MultipartOptions.thresholdBytes](#thresholdbytes) still fall back to a single-shot `PUT` automatically. Set to `false` to force the legacy single-shot behaviour (e.g. when targeting an S3-compatible endpoint that does not support `CreateMultipartUpload`). | [src/providers/web/S3Provider.ts:87](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L87) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:91](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L91) |
| <a id="resumestore"></a> `resumeStore?` | [`S3MultipartResumeStore`](S3MultipartResumeStore.md) | Optional persistent store enabling cross-process resume of incomplete multipart uploads. When provided, in-flight `uploadId` plus uploaded part etags are checkpointed after every part; on retry the upload reuses the stored state and skips the bytes already transferred. | [src/providers/web/S3Provider.ts:98](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L98) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:89](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/web/S3Provider.ts#L89) |
