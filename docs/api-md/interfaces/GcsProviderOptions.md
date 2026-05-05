[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GcsProviderOptions

# Interface: GcsProviderOptions

Defined in: [src/providers/cloud/GcsProvider.ts:54](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L54)

Options accepted by [createGcsProviderFactory](../functions/createGcsProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the JSON API base URL. | [src/providers/cloud/GcsProvider.ts:60](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L60) |
| <a id="bucket"></a> `bucket` | `string` | Bucket name. Required. | [src/providers/cloud/GcsProvider.ts:58](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L58) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/GcsProvider.ts:66](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L66) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GcsProvider.ts:64](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L64) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"gcs"`. | [src/providers/cloud/GcsProvider.ts:56](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L56) |
| <a id="multipart"></a> `multipart?` | [`GcsMultipartOptions`](GcsMultipartOptions.md) | Resumable upload session tuning. Enabled by default. | [src/providers/cloud/GcsProvider.ts:68](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L68) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload API base URL. | [src/providers/cloud/GcsProvider.ts:62](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GcsProvider.ts#L62) |
