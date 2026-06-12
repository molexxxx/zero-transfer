[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AzureBlobMultipartOptions

# Interface: AzureBlobMultipartOptions

Defined in: [src/providers/cloud/AzureBlobProvider.ts:86](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/AzureBlobProvider.ts#L86)

Multipart (staged block) upload tuning for the Azure Blob provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable staged-block uploads via `Put Block` + `Put Block List`. **Defaults to `true`** so payloads above [AzureBlobMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size blocks instead of being buffered into a single PUT. Set to `false` to force single-shot block-blob PUTs. | [src/providers/cloud/AzureBlobProvider.ts:93](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/AzureBlobProvider.ts#L93) |
| <a id="partconcurrency"></a> `partConcurrency?` | `number` | Number of blocks staged concurrently. Defaults to `4`; `1` reproduces the sequential one-block-at-a-time behavior. Buffered memory is bounded at `(partConcurrency + 1) x partSizeBytes`. Progress and resume checkpoints advance on the contiguous prefix of staged blocks. | [src/providers/cloud/AzureBlobProvider.ts:104](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/AzureBlobProvider.ts#L104) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target block size in bytes. Defaults to 8 MiB. Maximum 4000 MiB per Azure. | [src/providers/cloud/AzureBlobProvider.ts:97](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/AzureBlobProvider.ts#L97) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold above which staged-block upload is used. Defaults to 8 MiB. | [src/providers/cloud/AzureBlobProvider.ts:95](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/cloud/AzureBlobProvider.ts#L95) |
