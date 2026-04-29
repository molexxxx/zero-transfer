[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebDavProviderOptions

# Interface: WebDavProviderOptions

Defined in: [src/providers/web/WebDavProvider.ts:49](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L49)

Options accepted by [createWebDavProviderFactory](../functions/createWebDavProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Path prefix prepended to remote paths. Defaults to `""`. | [src/providers/web/WebDavProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L55) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request. | [src/providers/web/WebDavProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L59) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/WebDavProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L57) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"webdav"`. | [src/providers/web/WebDavProvider.ts:51](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L51) |
| <a id="secure"></a> `secure?` | `boolean` | Whether the transport is TLS. Defaults to `false`; set `true` or use https `port`. | [src/providers/web/WebDavProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/web/WebDavProvider.ts#L53) |
