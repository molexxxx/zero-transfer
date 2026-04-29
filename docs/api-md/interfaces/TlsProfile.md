[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TlsProfile

# Interface: TlsProfile

Defined in: [src/types/public.ts:145](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L145)

TLS settings shared by certificate-aware providers such as FTPS and future HTTPS/WebDAV adapters.

Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
and are resolved by providers before opening TLS sockets.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ca"></a> `ca?` | [`TlsSecretSource`](../type-aliases/TlsSecretSource.md) | Certificate authority bundle used to validate private or self-signed endpoints. | [src/types/public.ts:147](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L147) |
| <a id="cert"></a> `cert?` | [`SecretSource`](../type-aliases/SecretSource.md) | Client certificate PEM used for mutual TLS when a provider requires it. | [src/types/public.ts:149](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L149) |
| <a id="checkserveridentity"></a> `checkServerIdentity?` | (`host`, `cert`) => `Error` \| `undefined` | Optional custom server identity checker for private PKI or certificate pinning. | [src/types/public.ts:177](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L177) |
| <a id="key"></a> `key?` | [`SecretSource`](../type-aliases/SecretSource.md) | Client private key PEM used with `cert`. | [src/types/public.ts:151](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L151) |
| <a id="maxversion"></a> `maxVersion?` | `SecureVersion` | Maximum TLS protocol version accepted by the client. | [src/types/public.ts:163](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L163) |
| <a id="minversion"></a> `minVersion?` | `SecureVersion` | Minimum TLS protocol version accepted by the client. | [src/types/public.ts:161](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L161) |
| <a id="passphrase"></a> `passphrase?` | [`SecretSource`](../type-aliases/SecretSource.md) | Passphrase for an encrypted private key or PFX/P12 bundle. | [src/types/public.ts:155](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L155) |
| <a id="pfx"></a> `pfx?` | [`SecretSource`](../type-aliases/SecretSource.md) | PFX/P12 client certificate bundle. | [src/types/public.ts:153](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L153) |
| <a id="pinnedfingerprint256"></a> `pinnedFingerprint256?` | `string` \| readonly `string`[] | Optional. Expected server certificate SHA-256 fingerprint(s) for **certificate pinning**, in hex form with or without colons. When present, the TLS handshake additionally requires the leaf certificate's SHA-256 fingerprint to match one of these values. Not required for normal CA-trusted endpoints — public CAs and `ca` bundles already gate trust via `rejectUnauthorized`. Pinning is **recommended for production** when you control the server and want defence-in-depth against rogue certificates issued by trusted CAs. **Example** `"AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"` | [src/types/public.ts:175](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L175) |
| <a id="rejectunauthorized"></a> `rejectUnauthorized?` | `boolean` | Whether TLS certificate validation is required. Defaults to `true`. | [src/types/public.ts:159](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L159) |
| <a id="servername"></a> `servername?` | `string` | Server name used for SNI and certificate identity checks. Defaults to the profile host. | [src/types/public.ts:157](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/types/public.ts#L157) |
