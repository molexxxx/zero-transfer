[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartPart

# Interface: S3MultipartPart

Defined in: [src/providers/web/S3Provider.ts:116](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L116)

Single part recorded in a multipart-upload checkpoint.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="byteend"></a> `byteEnd` | `number` | Cumulative byte offset reached after this part (exclusive). | [src/providers/web/S3Provider.ts:120](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L120) |
| <a id="etag"></a> `etag` | `string` | - | [src/providers/web/S3Provider.ts:118](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L118) |
| <a id="partnumber"></a> `partNumber` | `number` | - | [src/providers/web/S3Provider.ts:117](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L117) |
