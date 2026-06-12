[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartOptions

# Interface: S3MultipartOptions

Defined in: [src/providers/web/S3Provider.ts:84](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L84)

Multipart upload tuning for the S3 provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable multipart upload. **Defaults to `true`** so large objects stream in fixed-size parts instead of being buffered in memory before a single `PUT`. Payloads at or below [S3MultipartOptions.thresholdBytes](#thresholdbytes) still fall back to a single-shot `PUT` automatically. Set to `false` to force single-shot behaviour (e.g. when targeting an S3-compatible endpoint that does not support `CreateMultipartUpload`). Single-shot uploads stream with `UNSIGNED-PAYLOAD` signing when the total size is known; S3 requires a `Content-Length` up front, so unknown-size payloads are buffered entirely in memory on this path. | [src/providers/web/S3Provider.ts:96](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L96) |
| <a id="partconcurrency"></a> `partConcurrency?` | `number` | Number of parts uploaded concurrently. Defaults to `4`; `1` reproduces the sequential one-part-at-a-time behavior. Buffered memory is bounded at `(partConcurrency + 1) x partSizeBytes` (32 + 8 MiB with defaults). Progress and resume checkpoints advance on the contiguous prefix of completed parts, so they stay monotonic under parallel completion. | [src/providers/web/S3Provider.ts:108](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L108) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target part size in bytes. Must be ≥ 5 MiB except for the final part. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:100](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L100) |
| <a id="resumestore"></a> ~~`resumeStore?`~~ | [`S3MultipartResumeStore`](S3MultipartResumeStore.md) | Optional persistent store enabling cross-process resume of incomplete multipart uploads. When provided, in-flight `uploadId` plus uploaded part etags are checkpointed after every part; on retry the upload reuses the stored state and skips the bytes already transferred. **Deprecated** Use the unified checkpoint model instead: pass `resume: { store: createFileSystemTransferCheckpointStore(...) }` to [runRoute](../functions/runRoute.md) / the transfer helpers (or set it as a client default). Unified checkpoints are keyed by source+destination path - not by job id - so they match across processes, and they work for every provider, not just S3. This store remains supported for compatibility. | [src/providers/web/S3Provider.ts:122](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L122) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold in bytes above which multipart is used. Defaults to 8 MiB. | [src/providers/web/S3Provider.ts:98](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/web/S3Provider.ts#L98) |
