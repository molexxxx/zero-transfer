[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSftpProviderFactory

# Function: createSftpProviderFactory()

```ts
function createSftpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:243](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/providers/native/sftp/NativeSftpProvider.ts#L243)

Creates a [ProviderFactory](../interfaces/ProviderFactory.md) backed by the native SSH/SFTP protocol
stack — no `ssh2` dependency required.

**Supported algorithms**
- Key exchange: `curve25519-sha256`, `curve25519-sha256@libssh.org`
- Host keys: `ssh-ed25519`, `ecdsa-sha2-nistp256/384/521`, `rsa-sha2-256`,
  `rsa-sha2-512` (legacy SHA-1 `ssh-rsa` is rejected)
- Ciphers: `aes128-ctr`, `aes256-ctr`
- MACs: `hmac-sha2-256`, `hmac-sha2-512`

**Authentication**
- `password`
- `keyboard-interactive` (RFC 4256)
- `publickey` for Ed25519 and RSA private keys (`rsa-sha2-512` preferred,
  `rsa-sha2-256` fallback). Encrypted keys are unlocked via
  `profile.ssh.passphrase`.

**Host-key verification**
- The server's signature over the exchange hash is always verified.
- Optional pinning via `profile.ssh.pinnedHostKeySha256` (`SHA256:...`,
  raw base64, or hex).
- Optional `profile.ssh.knownHosts` (OpenSSH format, hashed and plain
  patterns, `[host]:port`, negation, and `@revoked` markers).

**Resilience**
- `readyTimeoutMs` bounds TCP connect + SSH handshake.
- `keepaliveIntervalMs` keeps idle sessions alive through stateful
  firewalls / NAT.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`SftpProviderOptions`](../interfaces/SftpProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

## Example

```ts
const client = createTransferClient({
  providers: [createNativeSftpProviderFactory({
    readyTimeoutMs: 10_000,
    keepaliveIntervalMs: 30_000,
  })],
});
const session = await client.connect({
  provider: "sftp",
  host: "sftp.example.com",
  username: "deploy",
  ssh: {
    privateKey: { kind: "literal", value: process.env.DEPLOY_KEY! },
    pinnedHostKeySha256: "SHA256:abc...",
  },
});
```
