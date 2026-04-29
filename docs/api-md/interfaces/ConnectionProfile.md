[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionProfile

# Interface: ConnectionProfile

Defined in: [src/types/public.ts:264](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L264)

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
| <a id="host"></a> `host` | `string` | Remote hostname or IP address. | [src/types/public.ts:270](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L270) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Per-profile logger override. | [src/types/public.ts:288](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L288) |
| <a id="password"></a> `password?` | [`SecretSource`](../type-aliases/SecretSource.md) | Password or deferred secret source for password-based authentication. | [src/types/public.ts:276](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L276) |
| <a id="port"></a> `port?` | `number` | Remote port; adapters should apply protocol defaults when omitted. | [src/types/public.ts:272](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L272) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol to use for this connection, overriding the client default. | [src/types/public.ts:268](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L268) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider to use for this connection. Prefer this over the compatibility protocol field. | [src/types/public.ts:266](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L266) |
| <a id="secure"></a> `secure?` | `boolean` | Whether encrypted transport should be requested for protocols that support it. | [src/types/public.ts:278](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L278) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel connection setup or long-running operations. | [src/types/public.ts:286](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L286) |
| <a id="ssh"></a> `ssh?` | [`SshProfile`](SshProfile.md) | SSH settings for SFTP providers. | [src/types/public.ts:282](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L282) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Operation or connection timeout in milliseconds. | [src/types/public.ts:284](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L284) |
| <a id="tls"></a> `tls?` | [`TlsProfile`](TlsProfile.md) | TLS settings for encrypted providers such as FTPS. | [src/types/public.ts:280](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L280) |
| <a id="username"></a> `username?` | [`SecretSource`](../type-aliases/SecretSource.md) | Username, account identifier, or deferred secret source for authentication. | [src/types/public.ts:274](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L274) |
