[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / S3MultipartCheckpoint

# Interface: S3MultipartCheckpoint

Defined in: [src/providers/web/S3Provider.ts:93](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/S3Provider.ts#L93)

Persisted multipart-upload checkpoint.

## Properties

| Property                         | Type                                               | Description                                    | Defined in                                                                                                                                                          |
| -------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="parts"></a> `parts`       | readonly [`S3MultipartPart`](S3MultipartPart.md)[] | Parts already accepted by S3, in upload order. | [src/providers/web/S3Provider.ts:96](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/S3Provider.ts#L96) |
| <a id="uploadid"></a> `uploadId` | `string`                                           | -                                              | [src/providers/web/S3Provider.ts:94](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/S3Provider.ts#L94) |
