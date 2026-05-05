[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TlsProfile

# Interface: TlsProfile

Defined in: [src/types/public.ts:164](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L164)

TLS settings shared by certificate-aware providers such as FTPS and future HTTPS/WebDAV adapters.

Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
and are resolved by providers before opening TLS sockets.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ca"></a> `ca?` | [`TlsSecretSource`](../type-aliases/TlsSecretSource.md) | Certificate authority bundle used to validate private or self-signed endpoints. | [src/types/public.ts:166](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L166) |
| <a id="cert"></a> `cert?` | [`SecretSource`](../type-aliases/SecretSource.md) | Client certificate PEM used for mutual TLS when a provider requires it. | [src/types/public.ts:168](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L168) |
| <a id="checkserveridentity"></a> `checkServerIdentity?` | (`host`, `cert`) => `Error` \| `undefined` | Optional custom server identity checker for private PKI or certificate pinning. | [src/types/public.ts:196](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L196) |
| <a id="key"></a> `key?` | [`SecretSource`](../type-aliases/SecretSource.md) | Client private key PEM used with `cert`. | [src/types/public.ts:170](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L170) |
| <a id="maxversion"></a> `maxVersion?` | `SecureVersion` | Maximum TLS protocol version accepted by the client. | [src/types/public.ts:182](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L182) |
| <a id="minversion"></a> `minVersion?` | `SecureVersion` | Minimum TLS protocol version accepted by the client. | [src/types/public.ts:180](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L180) |
| <a id="passphrase"></a> `passphrase?` | [`SecretSource`](../type-aliases/SecretSource.md) | Passphrase for an encrypted private key or PFX/P12 bundle. | [src/types/public.ts:174](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L174) |
| <a id="pfx"></a> `pfx?` | [`SecretSource`](../type-aliases/SecretSource.md) | PFX/P12 client certificate bundle. | [src/types/public.ts:172](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L172) |
| <a id="pinnedfingerprint256"></a> `pinnedFingerprint256?` | `string` \| readonly `string`[] | Optional. Expected server certificate SHA-256 fingerprint(s) for **certificate pinning**, in hex form with or without colons. When present, the TLS handshake additionally requires the leaf certificate's SHA-256 fingerprint to match one of these values. Not required for normal CA-trusted endpoints - public CAs and `ca` bundles already gate trust via `rejectUnauthorized`. Pinning is **recommended for production** when you control the server and want defence-in-depth against rogue certificates issued by trusted CAs. **Example** `"AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"` | [src/types/public.ts:194](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L194) |
| <a id="rejectunauthorized"></a> `rejectUnauthorized?` | `boolean` | Whether TLS certificate validation is required. Defaults to `true`. | [src/types/public.ts:178](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L178) |
| <a id="servername"></a> `servername?` | `string` | Server name used for SNI and certificate identity checks. Defaults to the profile host. | [src/types/public.ts:176](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L176) |
