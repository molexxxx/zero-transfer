[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebDavProviderOptions

# Interface: WebDavProviderOptions

Defined in: [src/providers/web/WebDavProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L53)

Options accepted by [createWebDavProviderFactory](../functions/createWebDavProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Path prefix prepended to remote paths. Defaults to `""`. | [src/providers/web/WebDavProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L59) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request. | [src/providers/web/WebDavProvider.ts:63](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L63) |
| <a id="enforcehttps"></a> `enforceHttps?` | `boolean` | Rejects factory creation when the transport is cleartext `http`. Defaults to `false`, where connecting with credentials over cleartext emits a process `SecurityWarning` instead of failing. | [src/providers/web/WebDavProvider.ts:69](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L69) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/WebDavProvider.ts:61](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L61) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"webdav"`. | [src/providers/web/WebDavProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L55) |
| <a id="secure"></a> `secure?` | `boolean` | Whether the transport is TLS. Defaults to `false`; set `true` or use https `port`. | [src/providers/web/WebDavProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L57) |
| <a id="uploadstreaming"></a> `uploadStreaming?` | `"when-known-size"` \| `"always"` \| `"never"` | Streaming policy for `PUT` request bodies. - `"always"` (default since 0.5) - always stream the body so memory use stays bounded regardless of payload size. When the caller declares `request.totalBytes` an explicit `Content-Length` is still sent (no chunked encoding); only unknown-size uploads fall back to HTTP/1.1 chunked transfer-encoding. Some legacy WebDAV servers reject `Transfer-Encoding: chunked` and respond `411 Length Required` or `501 Not Implemented`; point those at `"when-known-size"`. - `"when-known-size"` (default before 0.5) - stream only when `request.totalBytes` is known; unknown-size bodies are buffered entirely in memory so a `Content-Length` can always be sent. Use for servers that require a declared length on every upload. - `"never"` - always buffer (legacy behaviour pre-0.4.0). Use for maximum compatibility at the cost of memory. | [src/providers/web/WebDavProvider.ts:87](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/WebDavProvider.ts#L87) |
