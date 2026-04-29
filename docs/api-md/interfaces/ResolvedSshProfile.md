[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolvedSshProfile

# Interface: ResolvedSshProfile

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:10](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/resolveConnectionProfileSecrets.ts#L10)

SSH profile with private-key and known-host material resolved.

## Extends

- `Omit`\<[`SshProfile`](SshProfile.md), `"knownHosts"` \| `"passphrase"` \| `"privateKey"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="agent"></a> `agent?` | [`SshAgentSource`](../type-aliases/SshAgentSource.md) | SSH agent socket path or agent instance used for agent-based public-key authentication. | [`SshProfile`](SshProfile.md).[`agent`](SshProfile.md#agent) | [src/types/public.ts:188](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L188) |
| <a id="algorithms"></a> `algorithms?` | `Algorithms` | Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression. | [`SshProfile`](SshProfile.md).[`algorithms`](SshProfile.md#algorithms) | [src/types/public.ts:190](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L190) |
| <a id="keyboardinteractive"></a> `keyboardInteractive?` | [`SshKeyboardInteractiveHandler`](../type-aliases/SshKeyboardInteractiveHandler.md) | Runtime callback that answers SSH keyboard-interactive authentication prompts. | [`SshProfile`](SshProfile.md).[`keyboardInteractive`](SshProfile.md#keyboardinteractive) | [src/types/public.ts:216](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L216) |
| <a id="knownhosts"></a> `knownHosts?` | \| [`SecretValue`](../type-aliases/SecretValue.md) \| [`SecretValue`](../type-aliases/SecretValue.md)[] | Resolved OpenSSH known_hosts material. | - | [src/profiles/resolveConnectionProfileSecrets.ts:19](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/resolveConnectionProfileSecrets.ts#L19) |
| <a id="passphrase"></a> `passphrase?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved private-key passphrase. | - | [src/profiles/resolveConnectionProfileSecrets.ts:17](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/resolveConnectionProfileSecrets.ts#L17) |
| <a id="pinnedhostkeysha256"></a> `pinnedHostKeySha256?` | `string` \| readonly `string`[] | Optional. SSH host-key SHA-256 fingerprint(s) the remote must present, in OpenSSH `SHA256:<base64>` form, raw base64, or hex. Use this as a lighter-weight alternative to a full `known_hosts` file when you only need to pin a single host. Like `knownHosts`, it is **optional but recommended for production**; leaving both unset disables host-key verification entirely. **Example** `"SHA256:abc123basesixfourpinFromKnownHosts="` | [`SshProfile`](SshProfile.md).[`pinnedHostKeySha256`](SshProfile.md#pinnedhostkeysha256) | [src/types/public.ts:214](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L214) |
| <a id="privatekey"></a> `privateKey?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved private key material. | - | [src/profiles/resolveConnectionProfileSecrets.ts:15](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/resolveConnectionProfileSecrets.ts#L15) |
| <a id="socketfactory"></a> `socketFactory?` | [`SshSocketFactory`](../type-aliases/SshSocketFactory.md) | Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket. | [`SshProfile`](SshProfile.md).[`socketFactory`](SshProfile.md#socketfactory) | [src/types/public.ts:218](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L218) |
