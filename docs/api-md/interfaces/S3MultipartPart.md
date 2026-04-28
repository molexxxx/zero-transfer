[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / S3MultipartPart

# Interface: S3MultipartPart

Defined in: [src/providers/web/S3Provider.ts:100](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/web/S3Provider.ts#L100)

Single part recorded in a multipart-upload checkpoint.

## Properties

| Property                             | Type     | Description                                                 | Defined in                                                                                                                                                            |
| ------------------------------------ | -------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="byteend"></a> `byteEnd`       | `number` | Cumulative byte offset reached after this part (exclusive). | [src/providers/web/S3Provider.ts:104](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/web/S3Provider.ts#L104) |
| <a id="etag"></a> `etag`             | `string` | -                                                           | [src/providers/web/S3Provider.ts:102](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/web/S3Provider.ts#L102) |
| <a id="partnumber"></a> `partNumber` | `number` | -                                                           | [src/providers/web/S3Provider.ts:101](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/web/S3Provider.ts#L101) |
