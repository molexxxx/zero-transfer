[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolvedTlsProfile

# Interface: ResolvedTlsProfile

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:23](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L23)

TLS profile with certificate-bearing secret sources resolved.

## Extends

- `Omit`\<[`TlsProfile`](TlsProfile.md), `"ca"` \| `"cert"` \| `"key"` \| `"passphrase"` \| `"pfx"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="ca"></a> `ca?` | \| [`SecretValue`](../type-aliases/SecretValue.md) \| [`SecretValue`](../type-aliases/SecretValue.md)[] | Resolved certificate authority bundle. | - | [src/profiles/resolveConnectionProfileSecrets.ts:28](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L28) |
| <a id="cert"></a> `cert?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved client certificate PEM. | - | [src/profiles/resolveConnectionProfileSecrets.ts:30](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L30) |
| <a id="checkserveridentity"></a> `checkServerIdentity?` | (`host`, `cert`) => `Error` \| `undefined` | Optional custom server identity checker for private PKI or certificate pinning. | [`TlsProfile`](TlsProfile.md).[`checkServerIdentity`](TlsProfile.md#checkserveridentity) | [src/types/public.ts:194](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L194) |
| <a id="key"></a> `key?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved client private key PEM. | - | [src/profiles/resolveConnectionProfileSecrets.ts:32](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L32) |
| <a id="maxversion"></a> `maxVersion?` | `SecureVersion` | Maximum TLS protocol version accepted by the client. | [`TlsProfile`](TlsProfile.md).[`maxVersion`](TlsProfile.md#maxversion) | [src/types/public.ts:180](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L180) |
| <a id="minversion"></a> `minVersion?` | `SecureVersion` | Minimum TLS protocol version accepted by the client. | [`TlsProfile`](TlsProfile.md).[`minVersion`](TlsProfile.md#minversion) | [src/types/public.ts:178](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L178) |
| <a id="passphrase"></a> `passphrase?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved encrypted private-key or PFX/P12 passphrase. | - | [src/profiles/resolveConnectionProfileSecrets.ts:34](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L34) |
| <a id="pfx"></a> `pfx?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved PFX/P12 client certificate bundle. | - | [src/profiles/resolveConnectionProfileSecrets.ts:36](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/resolveConnectionProfileSecrets.ts#L36) |
| <a id="pinnedfingerprint256"></a> `pinnedFingerprint256?` | `string` \| readonly `string`[] | Optional. Expected server certificate SHA-256 fingerprint(s) for **certificate pinning**, in hex form with or without colons. When present, the TLS handshake additionally requires the leaf certificate's SHA-256 fingerprint to match one of these values. Not required for normal CA-trusted endpoints — public CAs and `ca` bundles already gate trust via `rejectUnauthorized`. Pinning is **recommended for production** when you control the server and want defence-in-depth against rogue certificates issued by trusted CAs. **Example** `"AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"` | [`TlsProfile`](TlsProfile.md).[`pinnedFingerprint256`](TlsProfile.md#pinnedfingerprint256) | [src/types/public.ts:192](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L192) |
| <a id="rejectunauthorized"></a> `rejectUnauthorized?` | `boolean` | Whether TLS certificate validation is required. Defaults to `true`. | [`TlsProfile`](TlsProfile.md).[`rejectUnauthorized`](TlsProfile.md#rejectunauthorized) | [src/types/public.ts:176](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L176) |
| <a id="servername"></a> `servername?` | `string` | Server name used for SNI and certificate identity checks. Defaults to the profile host. | [`TlsProfile`](TlsProfile.md).[`servername`](TlsProfile.md#servername) | [src/types/public.ts:174](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/types/public.ts#L174) |
