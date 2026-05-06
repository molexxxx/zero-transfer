[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GcsMultipartOptions

# Interface: GcsMultipartOptions

Defined in: [src/providers/cloud/GcsProvider.ts:72](https://github.com/tonywied17/zero-transfer/blob/5215796cfdc2e79e8f55ee271567646774058098/src/providers/cloud/GcsProvider.ts#L72)

Resumable-upload session tuning for the GCS provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable resumable upload sessions. **Defaults to `true`** so payloads above [GcsMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size chunks via the resumable session endpoint instead of being buffered into a single `uploadType=media` POST. Set to `false` to force the legacy single-shot behaviour. | [src/providers/cloud/GcsProvider.ts:80](https://github.com/tonywied17/zero-transfer/blob/5215796cfdc2e79e8f55ee271567646774058098/src/providers/cloud/GcsProvider.ts#L80) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target chunk size in bytes. Must be a multiple of 256 KiB per the GCS protocol (the final chunk is exempt). Defaults to 8 MiB. | [src/providers/cloud/GcsProvider.ts:87](https://github.com/tonywied17/zero-transfer/blob/5215796cfdc2e79e8f55ee271567646774058098/src/providers/cloud/GcsProvider.ts#L87) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold above which a resumable session is used. Defaults to 8 MiB. | [src/providers/cloud/GcsProvider.ts:82](https://github.com/tonywied17/zero-transfer/blob/5215796cfdc2e79e8f55ee271567646774058098/src/providers/cloud/GcsProvider.ts#L82) |
