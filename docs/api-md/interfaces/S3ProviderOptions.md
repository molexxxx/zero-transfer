[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3ProviderOptions

# Interface: S3ProviderOptions

Defined in: [src/providers/web/S3Provider.ts:60](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L60)

Options accepted by [createS3ProviderFactory](../functions/createS3ProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bucket"></a> `bucket?` | `string` | Required bucket name; can be overridden per connection via `profile.host`. | [src/providers/web/S3Provider.ts:64](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L64) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request before signing. | [src/providers/web/S3Provider.ts:76](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L76) |
| <a id="endpoint"></a> `endpoint?` | `string` | Custom endpoint base URL (e.g. MinIO, R2). Defaults to `https://s3.<region>.amazonaws.com`. | [src/providers/web/S3Provider.ts:70](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L70) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/S3Provider.ts:74](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L74) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"s3"`. | [src/providers/web/S3Provider.ts:62](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L62) |
| <a id="multipart"></a> `multipart?` | [`S3MultipartOptions`](S3MultipartOptions.md) | Multipart upload tuning. Enabled by default; see [S3MultipartOptions.enabled](S3MultipartOptions.md#enabled). | [src/providers/web/S3Provider.ts:80](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L80) |
| <a id="pathstyle"></a> `pathStyle?` | `boolean` | Whether to use path-style URLs (`endpoint/bucket/key`). Defaults to `true`. | [src/providers/web/S3Provider.ts:72](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L72) |
| <a id="region"></a> `region?` | `string` | AWS region. Defaults to `"us-east-1"`. | [src/providers/web/S3Provider.ts:66](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L66) |
| <a id="service"></a> `service?` | `string` | Service identifier for SigV4. Defaults to `"s3"`. | [src/providers/web/S3Provider.ts:68](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L68) |
| <a id="sessiontoken"></a> `sessionToken?` | [`SecretSource`](../type-aliases/SecretSource.md) | Optional STS session token applied to every request. | [src/providers/web/S3Provider.ts:78](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/S3Provider.ts#L78) |
