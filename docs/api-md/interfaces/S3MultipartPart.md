[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartPart

# Interface: S3MultipartPart

Defined in: [src/providers/web/S3Provider.ts:122](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/providers/web/S3Provider.ts#L122)

Single part recorded in a multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Cumulative byte offset reached after this part (exclusive). | [src/providers/web/S3Provider.ts:126](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/providers/web/S3Provider.ts#L126) |
| <a id="etag"></a> `etag` | `string` | - | [src/providers/web/S3Provider.ts:124](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/providers/web/S3Provider.ts#L124) |
| <a id="partnumber"></a> `partNumber` | `number` | - | [src/providers/web/S3Provider.ts:123](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/providers/web/S3Provider.ts#L123) |
