[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolvedConnectionProfile

# Interface: ResolvedConnectionProfile

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:40](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/resolveConnectionProfileSecrets.ts#L40)

Connection profile with username, password, TLS, and SSH material sources resolved.

## Extends

- `Omit`\<[`ConnectionProfile`](ConnectionProfile.md), `"password"` \| `"ssh"` \| `"tls"` \| `"username"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="host"></a> `host` | `string` | Remote hostname or IP address. | [`ConnectionProfile`](ConnectionProfile.md).[`host`](ConnectionProfile.md#host) | [src/types/public.ts:270](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L270) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Per-profile logger override. | [`ConnectionProfile`](ConnectionProfile.md).[`logger`](ConnectionProfile.md#logger) | [src/types/public.ts:288](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L288) |
| <a id="password"></a> `password?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved password or credential bytes. | - | [src/profiles/resolveConnectionProfileSecrets.ts:47](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/resolveConnectionProfileSecrets.ts#L47) |
| <a id="port"></a> `port?` | `number` | Remote port; adapters should apply protocol defaults when omitted. | [`ConnectionProfile`](ConnectionProfile.md).[`port`](ConnectionProfile.md#port) | [src/types/public.ts:272](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L272) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol to use for this connection, overriding the client default. | [`ConnectionProfile`](ConnectionProfile.md).[`protocol`](ConnectionProfile.md#protocol) | [src/types/public.ts:268](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L268) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider to use for this connection. Prefer this over the compatibility protocol field. | [`ConnectionProfile`](ConnectionProfile.md).[`provider`](ConnectionProfile.md#provider) | [src/types/public.ts:266](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L266) |
| <a id="secure"></a> `secure?` | `boolean` | Whether encrypted transport should be requested for protocols that support it. | [`ConnectionProfile`](ConnectionProfile.md).[`secure`](ConnectionProfile.md#secure) | [src/types/public.ts:278](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L278) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel connection setup or long-running operations. | [`ConnectionProfile`](ConnectionProfile.md).[`signal`](ConnectionProfile.md#signal) | [src/types/public.ts:286](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L286) |
| <a id="ssh"></a> `ssh?` | [`ResolvedSshProfile`](ResolvedSshProfile.md) | Resolved SSH profile when private-key material is configured. | - | [src/profiles/resolveConnectionProfileSecrets.ts:51](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/resolveConnectionProfileSecrets.ts#L51) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Operation or connection timeout in milliseconds. | [`ConnectionProfile`](ConnectionProfile.md).[`timeoutMs`](ConnectionProfile.md#timeoutms) | [src/types/public.ts:284](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L284) |
| <a id="tls"></a> `tls?` | [`ResolvedTlsProfile`](ResolvedTlsProfile.md) | Resolved TLS profile when certificate material is configured. | - | [src/profiles/resolveConnectionProfileSecrets.ts:49](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/resolveConnectionProfileSecrets.ts#L49) |
| <a id="username"></a> `username?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved username or account identifier. | - | [src/profiles/resolveConnectionProfileSecrets.ts:45](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/resolveConnectionProfileSecrets.ts#L45) |
