[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3ProviderOptions

# Interface: S3ProviderOptions

Defined in: [src/providers/web/S3Provider.ts:57](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L57)

Options accepted by [createS3ProviderFactory](../functions/createS3ProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bucket"></a> `bucket?` | `string` | Required bucket name; can be overridden per connection via `profile.host`. | [src/providers/web/S3Provider.ts:61](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L61) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before signing. | [src/providers/web/S3Provider.ts:73](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L73) |
| <a id="endpoint"></a> `endpoint?` | `string` | Custom endpoint base URL (e.g. MinIO, R2). Defaults to `https://s3.<region>.amazonaws.com`. | [src/providers/web/S3Provider.ts:67](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L67) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/S3Provider.ts:71](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L71) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"s3"`. | [src/providers/web/S3Provider.ts:59](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L59) |
| <a id="multipart"></a> `multipart?` | [`S3MultipartOptions`](S3MultipartOptions.md) | Multipart upload tuning. Enabled by default; see [S3MultipartOptions.enabled](S3MultipartOptions.md#enabled). | [src/providers/web/S3Provider.ts:77](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L77) |
| <a id="pathstyle"></a> `pathStyle?` | `boolean` | Whether to use path-style URLs (`endpoint/bucket/key`). Defaults to `true`. | [src/providers/web/S3Provider.ts:69](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L69) |
| <a id="region"></a> `region?` | `string` | AWS region. Defaults to `"us-east-1"`. | [src/providers/web/S3Provider.ts:63](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L63) |
| <a id="service"></a> `service?` | `string` | Service identifier for SigV4. Defaults to `"s3"`. | [src/providers/web/S3Provider.ts:65](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L65) |
| <a id="sessiontoken"></a> `sessionToken?` | [`SecretSource`](../type-aliases/SecretSource.md) | Optional STS session token applied to every request. | [src/providers/web/S3Provider.ts:75](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L75) |
