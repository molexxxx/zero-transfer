[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshProfile

# Interface: SshProfile

Defined in: [src/types/public.ts:205](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L205)

SSH authentication material for SFTP-style providers.

Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
and are resolved by providers before opening SSH sessions.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="agent"></a> `agent?` | [`SshAgentSource`](../type-aliases/SshAgentSource.md) | SSH agent socket path or agent instance used for agent-based public-key authentication. | [src/types/public.ts:207](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L207) |
| <a id="algorithms"></a> `algorithms?` | [`SshAlgorithms`](../type-aliases/SshAlgorithms.md) | Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression. | [src/types/public.ts:209](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L209) |
| <a id="keyboardinteractive"></a> `keyboardInteractive?` | [`SshKeyboardInteractiveHandler`](../type-aliases/SshKeyboardInteractiveHandler.md) | Runtime callback that answers SSH keyboard-interactive authentication prompts. | [src/types/public.ts:235](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L235) |
| <a id="knownhosts"></a> `knownHosts?` | [`SshKnownHostsSource`](../type-aliases/SshKnownHostsSource.md) | Optional. OpenSSH `known_hosts` content used for **strict SFTP host-key verification**. Mutually exclusive with provider-level `hostHash`/`hostVerifier` options. Not required for the connection to succeed, but **strongly recommended for production**: without `knownHosts` (and without [pinnedHostKeySha256](#pinnedhostkeysha256)), the SSH session accepts any host key the server presents, leaving you exposed to MITM. | [src/types/public.ts:222](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L222) |
| <a id="passphrase"></a> `passphrase?` | [`SecretSource`](../type-aliases/SecretSource.md) | Passphrase used to decrypt an encrypted private key. | [src/types/public.ts:213](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L213) |
| <a id="pinnedhostkeysha256"></a> `pinnedHostKeySha256?` | `string` \| readonly `string`[] | Optional. SSH host-key SHA-256 fingerprint(s) the remote must present, in OpenSSH `SHA256:<base64>` form, raw base64, or hex. Use this as a lighter-weight alternative to a full `known_hosts` file when you only need to pin a single host. Like `knownHosts`, it is **optional but recommended for production**; leaving both unset disables host-key verification entirely. **Example** `"SHA256:abc123basesixfourpinFromKnownHosts="` | [src/types/public.ts:233](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L233) |
| <a id="privatekey"></a> `privateKey?` | [`SecretSource`](../type-aliases/SecretSource.md) | Private key material used for public-key authentication. | [src/types/public.ts:211](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L211) |
| <a id="socketfactory"></a> `socketFactory?` | [`SshSocketFactory`](../type-aliases/SshSocketFactory.md) | Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket. | [src/types/public.ts:237](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L237) |
