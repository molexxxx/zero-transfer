[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshProfile

# Interface: SshProfile

Defined in: [src/types/public.ts:186](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L186)

SSH authentication material for SFTP-style providers.

Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
and are resolved by providers before opening SSH sessions.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="agent"></a> `agent?` | [`SshAgentSource`](../type-aliases/SshAgentSource.md) | SSH agent socket path or agent instance used for agent-based public-key authentication. | [src/types/public.ts:188](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L188) |
| <a id="algorithms"></a> `algorithms?` | `Algorithms` | Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression. | [src/types/public.ts:190](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L190) |
| <a id="keyboardinteractive"></a> `keyboardInteractive?` | [`SshKeyboardInteractiveHandler`](../type-aliases/SshKeyboardInteractiveHandler.md) | Runtime callback that answers SSH keyboard-interactive authentication prompts. | [src/types/public.ts:216](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L216) |
| <a id="knownhosts"></a> `knownHosts?` | [`SshKnownHostsSource`](../type-aliases/SshKnownHostsSource.md) | Optional. OpenSSH `known_hosts` content used for **strict SFTP host-key verification**. Mutually exclusive with provider-level `hostHash`/`hostVerifier` options. Not required for the connection to succeed, but **strongly recommended for production**: without `knownHosts` (and without [pinnedHostKeySha256](#pinnedhostkeysha256)), the SSH session accepts any host key the server presents, leaving you exposed to MITM. | [src/types/public.ts:203](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L203) |
| <a id="passphrase"></a> `passphrase?` | [`SecretSource`](../type-aliases/SecretSource.md) | Passphrase used to decrypt an encrypted private key. | [src/types/public.ts:194](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L194) |
| <a id="pinnedhostkeysha256"></a> `pinnedHostKeySha256?` | `string` \| readonly `string`[] | Optional. SSH host-key SHA-256 fingerprint(s) the remote must present, in OpenSSH `SHA256:<base64>` form, raw base64, or hex. Use this as a lighter-weight alternative to a full `known_hosts` file when you only need to pin a single host. Like `knownHosts`, it is **optional but recommended for production**; leaving both unset disables host-key verification entirely. **Example** `"SHA256:abc123basesixfourpinFromKnownHosts="` | [src/types/public.ts:214](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L214) |
| <a id="privatekey"></a> `privateKey?` | [`SecretSource`](../type-aliases/SecretSource.md) | Private key material used for public-key authentication. | [src/types/public.ts:192](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L192) |
| <a id="socketfactory"></a> `socketFactory?` | [`SshSocketFactory`](../type-aliases/SshSocketFactory.md) | Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket. | [src/types/public.ts:218](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/types/public.ts#L218) |
