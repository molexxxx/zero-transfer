[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ConnectionProfile

# Interface: ConnectionProfile

Defined in: [src/types/public.ts:198](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L198)

Connection settings accepted by facade and adapter implementations.

## Properties

| Property                            | Type                                              | Description                                                                             | Defined in                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="host"></a> `host`            | `string`                                          | Remote hostname or IP address.                                                          | [src/types/public.ts:204](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L204) |
| <a id="logger"></a> `logger?`       | [`ZeroTransferLogger`](ZeroTransferLogger.md)     | Per-profile logger override.                                                            | [src/types/public.ts:222](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L222) |
| <a id="password"></a> `password?`   | [`SecretSource`](../type-aliases/SecretSource.md) | Password or deferred secret source for password-based authentication.                   | [src/types/public.ts:210](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L210) |
| <a id="port"></a> `port?`           | `number`                                          | Remote port; adapters should apply protocol defaults when omitted.                      | [src/types/public.ts:206](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L206) |
| <a id="protocol"></a> `protocol?`   | `"ftp"` \| `"ftps"` \| `"sftp"`                   | Protocol to use for this connection, overriding the client default.                     | [src/types/public.ts:202](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L202) |
| <a id="provider"></a> `provider?`   | [`ProviderId`](../type-aliases/ProviderId.md)     | Provider to use for this connection. Prefer this over the compatibility protocol field. | [src/types/public.ts:200](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L200) |
| <a id="secure"></a> `secure?`       | `boolean`                                         | Whether encrypted transport should be requested for protocols that support it.          | [src/types/public.ts:212](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L212) |
| <a id="signal"></a> `signal?`       | `AbortSignal`                                     | Abort signal used to cancel connection setup or long-running operations.                | [src/types/public.ts:220](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L220) |
| <a id="ssh"></a> `ssh?`             | [`SshProfile`](SshProfile.md)                     | SSH settings for SFTP providers.                                                        | [src/types/public.ts:216](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L216) |
| <a id="timeoutms"></a> `timeoutMs?` | `number`                                          | Operation or connection timeout in milliseconds.                                        | [src/types/public.ts:218](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L218) |
| <a id="tls"></a> `tls?`             | [`TlsProfile`](TlsProfile.md)                     | TLS settings for encrypted providers such as FTPS.                                      | [src/types/public.ts:214](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L214) |
| <a id="username"></a> `username?`   | [`SecretSource`](../type-aliases/SecretSource.md) | Username, account identifier, or deferred secret source for authentication.             | [src/types/public.ts:208](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L208) |
