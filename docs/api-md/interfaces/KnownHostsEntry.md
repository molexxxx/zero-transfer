[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / KnownHostsEntry

# Interface: KnownHostsEntry

Defined in: [src/profiles/importers/KnownHostsParser.ts:13](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L13)

Parsed entry from an OpenSSH `known_hosts` file.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="comment"></a> `comment?` | `string` | Trailing comment text, if any. | [src/profiles/importers/KnownHostsParser.ts:27](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L27) |
| <a id="hashedhash"></a> `hashedHash?` | `string` | Hashed-hash component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. | [src/profiles/importers/KnownHostsParser.ts:21](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L21) |
| <a id="hashedsalt"></a> `hashedSalt?` | `string` | Hashed-salt component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. | [src/profiles/importers/KnownHostsParser.ts:19](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L19) |
| <a id="hostpatterns"></a> `hostPatterns` | readonly `string`[] | Raw, comma-separated host patterns. Negation patterns retain their leading `!`. | [src/profiles/importers/KnownHostsParser.ts:17](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L17) |
| <a id="keybase64"></a> `keyBase64` | `string` | Base64-encoded public key blob. | [src/profiles/importers/KnownHostsParser.ts:25](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L25) |
| <a id="keytype"></a> `keyType` | `string` | SSH key algorithm identifier (e.g. `ssh-ed25519`, `ecdsa-sha2-nistp256`). | [src/profiles/importers/KnownHostsParser.ts:23](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L23) |
| <a id="marker"></a> `marker?` | [`KnownHostsMarker`](../type-aliases/KnownHostsMarker.md) | Optional line marker (`@cert-authority` or `@revoked`). | [src/profiles/importers/KnownHostsParser.ts:15](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L15) |
| <a id="raw"></a> `raw` | `string` | Original line text without trailing newline. | [src/profiles/importers/KnownHostsParser.ts:29](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/importers/KnownHostsParser.ts#L29) |
