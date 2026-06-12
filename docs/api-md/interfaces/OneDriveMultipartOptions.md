[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OneDriveMultipartOptions

# Interface: OneDriveMultipartOptions

Defined in: [src/providers/cloud/OneDriveProvider.ts:75](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/OneDriveProvider.ts#L75)

Resumable-upload session tuning for the OneDrive provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable Microsoft Graph upload sessions. **Defaults to `true`** so payloads above [OneDriveMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size chunks via `createUploadSession` instead of being buffered into a single `PUT /content`. Set to `false` to force the legacy single-shot behaviour. | [src/providers/cloud/OneDriveProvider.ts:82](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/OneDriveProvider.ts#L82) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Target chunk size in bytes. Must be a multiple of 320 KiB per the Graph protocol (the final chunk is exempt). Defaults to 10 MiB. | [src/providers/cloud/OneDriveProvider.ts:89](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/OneDriveProvider.ts#L89) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Object size threshold above which an upload session is used. Defaults to 4 MiB. | [src/providers/cloud/OneDriveProvider.ts:84](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/OneDriveProvider.ts#L84) |
