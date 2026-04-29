[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpProviderOptions

# Interface: HttpProviderOptions

Defined in: [src/providers/web/HttpProvider.ts:48](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L48)

Options accepted by [createHttpProviderFactory](../functions/createHttpProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Base URL prefix prepended to relative endpoint paths. Defaults to `""`. | [src/providers/web/HttpProvider.ts:54](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L54) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request. | [src/providers/web/HttpProvider.ts:58](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L58) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/HttpProvider.ts:56](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L56) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"http"`. Set to `"https"` for the HTTPS variant. | [src/providers/web/HttpProvider.ts:50](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L50) |
| <a id="secure"></a> `secure?` | `boolean` | Whether the provider should treat connections as TLS-only. Defaults to `true` when `id === "https"`. | [src/providers/web/HttpProvider.ts:52](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/web/HttpProvider.ts#L52) |
