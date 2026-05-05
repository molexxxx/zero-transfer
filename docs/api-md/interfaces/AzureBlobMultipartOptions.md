[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AzureBlobMultipartOptions

# Interface: AzureBlobMultipartOptions

Defined in: [src/providers/cloud/AzureBlobProvider.ts:80](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L80)

Multipart (staged block) upload tuning for the Azure Blob provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable staged-block uploads via `Put Block` + `Put Block List`. **Defaults to `true`** so payloads above [AzureBlobMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size blocks instead of being buffered into a single PUT. Set to `false` to force single-shot block-blob PUTs. | [src/providers/cloud/AzureBlobProvider.ts:87](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L87) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target block size in bytes. Defaults to 8 MiB. Maximum 4000 MiB per Azure. | [src/providers/cloud/AzureBlobProvider.ts:91](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L91) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold above which staged-block upload is used. Defaults to 8 MiB. | [src/providers/cloud/AzureBlobProvider.ts:89](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/AzureBlobProvider.ts#L89) |
