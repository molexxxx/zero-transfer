[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionProfile

# Interface: ConnectionProfile

Defined in: [src/types/public.ts:283](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L283)

Connection settings accepted by facade and adapter implementations.

Every `ConnectionProfile` has a `host` and a `provider` (or `protocol`).
Authentication and transport-specific material is layered on via the
optional `ssh`, `tls`, `oauth`, and provider-specific blocks (e.g. `s3`,
`azure`, `dropbox`).

## Examples

```ts
const profile: ConnectionProfile = {
  host: "sftp.example.com",
  provider: "sftp",
  username: "deploy",
  ssh: {
    privateKey: { path: "./keys/id_ed25519" },
    pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
  },
};
```

```ts
const profile: ConnectionProfile = {
  host: "ftps.example.com",
  provider: "ftps",
  username: "deploy",
  password: { env: "FTPS_PASSWORD" },
  tls: { minVersion: "TLSv1.2" },
};
```

```ts
const profile: ConnectionProfile = {
  host: "my-bucket",
  provider: "s3",
  username: process.env.AWS_ACCESS_KEY_ID,
  password: { env: "AWS_SECRET_ACCESS_KEY" },
  s3: { region: "us-east-1" },
};
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="host"></a> `host` | `string` | Remote hostname or IP address. | [src/types/public.ts:289](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L289) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Per-profile logger override. | [src/types/public.ts:307](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L307) |
| <a id="password"></a> `password?` | [`SecretSource`](../type-aliases/SecretSource.md) | Password or deferred secret source for password-based authentication. | [src/types/public.ts:295](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L295) |
| <a id="port"></a> `port?` | `number` | Remote port; adapters should apply protocol defaults when omitted. | [src/types/public.ts:291](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L291) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol to use for this connection, overriding the client default. | [src/types/public.ts:287](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L287) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider to use for this connection. Prefer this over the compatibility protocol field. | [src/types/public.ts:285](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L285) |
| <a id="secure"></a> `secure?` | `boolean` | Whether encrypted transport should be requested for protocols that support it. | [src/types/public.ts:297](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L297) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel connection setup or long-running operations. | [src/types/public.ts:305](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L305) |
| <a id="ssh"></a> `ssh?` | [`SshProfile`](SshProfile.md) | SSH settings for SFTP providers. | [src/types/public.ts:301](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L301) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Operation or connection timeout in milliseconds. | [src/types/public.ts:303](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L303) |
| <a id="tls"></a> `tls?` | [`TlsProfile`](TlsProfile.md) | TLS settings for encrypted providers such as FTPS. | [src/types/public.ts:299](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L299) |
| <a id="username"></a> `username?` | [`SecretSource`](../type-aliases/SecretSource.md) | Username, account identifier, or deferred secret source for authentication. | [src/types/public.ts:293](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L293) |
