[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GcsProviderOptions

# Interface: GcsProviderOptions

Defined in: [src/providers/cloud/GcsProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L55)

Options accepted by [createGcsProviderFactory](../functions/createGcsProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the JSON API base URL. | [src/providers/cloud/GcsProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L61) |
| <a id="bucket"></a> `bucket` | `string` | Bucket name. Required. | [src/providers/cloud/GcsProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L59) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/GcsProvider.ts:67](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L67) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GcsProvider.ts:65](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L65) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"gcs"`. | [src/providers/cloud/GcsProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L57) |
| <a id="multipart"></a> `multipart?` | [`GcsMultipartOptions`](GcsMultipartOptions.md) | Resumable upload session tuning. Enabled by default. | [src/providers/cloud/GcsProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L69) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload API base URL. | [src/providers/cloud/GcsProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/GcsProvider.ts#L63) |
