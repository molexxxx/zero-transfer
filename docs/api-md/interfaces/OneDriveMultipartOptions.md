[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OneDriveMultipartOptions

# Interface: OneDriveMultipartOptions

Defined in: [src/providers/cloud/OneDriveProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L74)

Resumable-upload session tuning for the OneDrive provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable Microsoft Graph upload sessions. **Defaults to `true`** so payloads above [OneDriveMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size chunks via `createUploadSession` instead of being buffered into a single `PUT /content`. Set to `false` to force the legacy single-shot behaviour. | [src/providers/cloud/OneDriveProvider.ts:81](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L81) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target chunk size in bytes. Must be a multiple of 320 KiB per the Graph protocol (the final chunk is exempt). Defaults to 10 MiB. | [src/providers/cloud/OneDriveProvider.ts:88](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L88) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold above which an upload session is used. Defaults to 4 MiB. | [src/providers/cloud/OneDriveProvider.ts:83](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L83) |
