[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolvedSshProfile

# Interface: ResolvedSshProfile

Defined in: [src/profiles/resolveConnectionProfileSecrets.ts:10](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/resolveConnectionProfileSecrets.ts#L10)

SSH profile with private-key and known-host material resolved.

## Extends

- `Omit`\<[`SshProfile`](SshProfile.md), `"knownHosts"` \| `"passphrase"` \| `"privateKey"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="agent"></a> `agent?` | [`SshAgentSource`](../type-aliases/SshAgentSource.md) | SSH agent socket path or agent instance used for agent-based public-key authentication. | [`SshProfile`](SshProfile.md).[`agent`](SshProfile.md#agent) | [src/types/public.ts:207](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L207) |
| <a id="algorithms"></a> `algorithms?` | [`SshAlgorithms`](../type-aliases/SshAlgorithms.md) | Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression. | [`SshProfile`](SshProfile.md).[`algorithms`](SshProfile.md#algorithms) | [src/types/public.ts:209](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L209) |
| <a id="keyboardinteractive"></a> `keyboardInteractive?` | [`SshKeyboardInteractiveHandler`](../type-aliases/SshKeyboardInteractiveHandler.md) | Runtime callback that answers SSH keyboard-interactive authentication prompts. | [`SshProfile`](SshProfile.md).[`keyboardInteractive`](SshProfile.md#keyboardinteractive) | [src/types/public.ts:235](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L235) |
| <a id="knownhosts"></a> `knownHosts?` | \| [`SecretValue`](../type-aliases/SecretValue.md) \| [`SecretValue`](../type-aliases/SecretValue.md)[] | Resolved OpenSSH known_hosts material. | - | [src/profiles/resolveConnectionProfileSecrets.ts:19](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/resolveConnectionProfileSecrets.ts#L19) |
| <a id="passphrase"></a> `passphrase?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved private-key passphrase. | - | [src/profiles/resolveConnectionProfileSecrets.ts:17](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/resolveConnectionProfileSecrets.ts#L17) |
| <a id="pinnedhostkeysha256"></a> `pinnedHostKeySha256?` | `string` \| readonly `string`[] | Optional. SSH host-key SHA-256 fingerprint(s) the remote must present, in OpenSSH `SHA256:<base64>` form, raw base64, or hex. Use this as a lighter-weight alternative to a full `known_hosts` file when you only need to pin a single host. Like `knownHosts`, it is **optional but recommended for production**; leaving both unset disables host-key verification entirely. **Example** `"SHA256:abc123basesixfourpinFromKnownHosts="` | [`SshProfile`](SshProfile.md).[`pinnedHostKeySha256`](SshProfile.md#pinnedhostkeysha256) | [src/types/public.ts:233](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L233) |
| <a id="privatekey"></a> `privateKey?` | [`SecretValue`](../type-aliases/SecretValue.md) | Resolved private key material. | - | [src/profiles/resolveConnectionProfileSecrets.ts:15](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/profiles/resolveConnectionProfileSecrets.ts#L15) |
| <a id="socketfactory"></a> `socketFactory?` | [`SshSocketFactory`](../type-aliases/SshSocketFactory.md) | Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket. | [`SshProfile`](SshProfile.md).[`socketFactory`](SshProfile.md#socketfactory) | [src/types/public.ts:237](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L237) |
