[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GoogleDriveMultipartOptions

# Interface: GoogleDriveMultipartOptions

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:87](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GoogleDriveProvider.ts#L87)

Resumable-session upload tuning for the Google Drive provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable resumable upload sessions (`uploadType=resumable`). **Defaults to `true`** so payloads above [GoogleDriveMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size chunks instead of being buffered into a single `multipart/related` request. Set to `false` to force single-shot uploads. | [src/providers/cloud/GoogleDriveProvider.ts:95](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GoogleDriveProvider.ts#L95) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Bytes per session chunk. Defaults to 8 MiB; must be a multiple of 256 KiB. | [src/providers/cloud/GoogleDriveProvider.ts:99](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GoogleDriveProvider.ts#L99) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Payload size threshold above which a resumable session is used. Defaults to 8 MiB. | [src/providers/cloud/GoogleDriveProvider.ts:97](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GoogleDriveProvider.ts#L97) |
