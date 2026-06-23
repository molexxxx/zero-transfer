[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / HttpProviderOptions

# Interface: HttpProviderOptions

Defined in: [src/providers/web/HttpProvider.ts:51](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L51)

Options accepted by [createHttpProviderFactory](../functions/createHttpProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Base URL prefix prepended to relative endpoint paths. Defaults to `""`. | [src/providers/web/HttpProvider.ts:57](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L57) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request. | [src/providers/web/HttpProvider.ts:61](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L61) |
| <a id="enforcehttps"></a> `enforceHttps?` | `boolean` | Rejects factory creation when the transport is cleartext `http`. Defaults to `false`, where connecting with credentials over cleartext emits a process `SecurityWarning` instead of failing. | [src/providers/web/HttpProvider.ts:67](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L67) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/HttpProvider.ts:59](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L59) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"http"`. Set to `"https"` for the HTTPS variant. | [src/providers/web/HttpProvider.ts:53](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L53) |
| <a id="secure"></a> `secure?` | `boolean` | Whether the provider should treat connections as TLS-only. Defaults to `true` when `id === "https"`. | [src/providers/web/HttpProvider.ts:55](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/HttpProvider.ts#L55) |
