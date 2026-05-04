[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebDavProviderOptions

# Interface: WebDavProviderOptions

Defined in: [src/providers/web/WebDavProvider.ts:49](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L49)

Options accepted by [createWebDavProviderFactory](../functions/createWebDavProviderFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Path prefix prepended to remote paths. Defaults to `""`. | [src/providers/web/WebDavProvider.ts:55](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L55) |
| <a id="defaultheaders"></a> `defaultHeaders?` | `Record`\<`string`, `string`\> | Default headers applied to every request. | [src/providers/web/WebDavProvider.ts:59](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L59) |
| <a id="fetch"></a> `fetch?` | [`HttpFetch`](../type-aliases/HttpFetch.md) | Custom fetch implementation. Defaults to global `fetch`. | [src/providers/web/WebDavProvider.ts:57](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L57) |
| <a id="id"></a> `id?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id to register. Defaults to `"webdav"`. | [src/providers/web/WebDavProvider.ts:51](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L51) |
| <a id="secure"></a> `secure?` | `boolean` | Whether the transport is TLS. Defaults to `false`; set `true` or use https `port`. | [src/providers/web/WebDavProvider.ts:53](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L53) |
| <a id="uploadstreaming"></a> `uploadStreaming?` | `"when-known-size"` \| `"always"` \| `"never"` | Streaming policy for `PUT` request bodies. - `"when-known-size"` (default) — stream when the caller declares `request.totalBytes` (an explicit `Content-Length` is sent so all WebDAV servers accept the upload); otherwise buffer the entire body in memory before sending. This is the safe default that does not require the server to accept HTTP/1.1 chunked transfer-encoding. - `"always"` — always stream the body, even when the size is unknown (the runtime will use chunked transfer-encoding). Some legacy WebDAV servers reject `Transfer-Encoding: chunked` and will respond `411 Length Required` or `501 Not Implemented`; only enable this for servers known to accept chunked uploads (modern Apache/nginx, IIS with chunked transfer enabled, Nextcloud, ownCloud, sabre/dav). - `"never"` — always buffer (legacy behaviour pre-0.4.0). Use for maximum compatibility at the cost of memory. | [src/providers/web/WebDavProvider.ts:77](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L77) |
