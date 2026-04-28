[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SshProfile

# Interface: SshProfile

Defined in: [src/types/public.ts:176](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L176)

SSH authentication material for SFTP-style providers.

Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
and are resolved by providers before opening SSH sessions.

## Properties

| Property                                                | Type                                                                                | Description                                                                                              | Defined in                                                                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="agent"></a> `agent?`                             | [`SshAgentSource`](../type-aliases/SshAgentSource.md)                               | SSH agent socket path or agent instance used for agent-based public-key authentication.                  | [src/types/public.ts:178](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L178) |
| <a id="algorithms"></a> `algorithms?`                   | `Algorithms`                                                                        | Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression.           | [src/types/public.ts:180](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L180) |
| <a id="keyboardinteractive"></a> `keyboardInteractive?` | [`SshKeyboardInteractiveHandler`](../type-aliases/SshKeyboardInteractiveHandler.md) | Runtime callback that answers SSH keyboard-interactive authentication prompts.                           | [src/types/public.ts:190](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L190) |
| <a id="knownhosts"></a> `knownHosts?`                   | [`SshKnownHostsSource`](../type-aliases/SshKnownHostsSource.md)                     | OpenSSH known_hosts content used for strict SFTP host-key verification.                                  | [src/types/public.ts:186](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L186) |
| <a id="passphrase"></a> `passphrase?`                   | [`SecretSource`](../type-aliases/SecretSource.md)                                   | Passphrase used to decrypt an encrypted private key.                                                     | [src/types/public.ts:184](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L184) |
| <a id="pinnedhostkeysha256"></a> `pinnedHostKeySha256?` | `string` \| readonly `string`[]                                                     | Expected SSH host-key SHA-256 fingerprint or fingerprints, using OpenSSH `SHA256:` form, base64, or hex. | [src/types/public.ts:188](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L188) |
| <a id="privatekey"></a> `privateKey?`                   | [`SecretSource`](../type-aliases/SecretSource.md)                                   | Private key material used for public-key authentication.                                                 | [src/types/public.ts:182](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L182) |
| <a id="socketfactory"></a> `socketFactory?`             | [`SshSocketFactory`](../type-aliases/SshSocketFactory.md)                           | Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket.         | [src/types/public.ts:192](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L192) |
