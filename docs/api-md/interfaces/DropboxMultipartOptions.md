[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DropboxMultipartOptions

# Interface: DropboxMultipartOptions

Defined in: [src/providers/cloud/DropboxProvider.ts:80](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L80)

Upload-session tuning for the Dropbox provider.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Enable chunked uploads via `upload_session/start` + `append_v2` + `finish`. **Defaults to `true`** so payloads above [DropboxMultipartOptions.thresholdBytes](#thresholdbytes) stream in fixed-size chunks instead of being buffered into a single `/2/files/upload` call (which Dropbox caps at 150 MB). Set to `false` to force single-shot uploads. | [src/providers/cloud/DropboxProvider.ts:89](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L89) |
| <a id="partsizebytes"></a> `partSizeBytes?` | `number` | Bytes per session append. Defaults to 8 MiB; must stay under Dropbox's 150 MB request cap. | [src/providers/cloud/DropboxProvider.ts:93](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L93) |
| <a id="thresholdbytes"></a> `thresholdBytes?` | `number` | Payload size threshold above which an upload session is used. Defaults to 8 MiB. | [src/providers/cloud/DropboxProvider.ts:91](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/DropboxProvider.ts#L91) |
