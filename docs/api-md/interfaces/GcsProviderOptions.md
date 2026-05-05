[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / GcsProviderOptions

# Interface: GcsProviderOptions

Defined in: [src/providers/cloud/GcsProvider.ts:51](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L51)

Options accepted by [createGcsProviderFactory](../functions/createGcsProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apibaseurl"></a> `apiBaseUrl?` | `string` | Override the JSON API base URL. | [src/providers/cloud/GcsProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L57) |
| <a id="bucket"></a> `bucket` | `string` | Bucket name. Required. | [src/providers/cloud/GcsProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L55) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied before bearer auth on every request. | [src/providers/cloud/GcsProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L63) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/cloud/GcsProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L61) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"gcs"`. | [src/providers/cloud/GcsProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L53) |
| <a id="uploadbaseurl"></a> `uploadBaseUrl?` | `string` | Override the upload API base URL. | [src/providers/cloud/GcsProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/cloud/GcsProvider.ts#L59) |
