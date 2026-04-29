[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSftpProviderFactory

# Function: createSftpProviderFactory()

```ts
function createSftpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/sftp/SftpProvider.ts:141](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/providers/classic/sftp/SftpProvider.ts#L141)

Creates an SFTP provider factory backed by the mature `ssh2` implementation.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`SftpProviderOptions`](../interfaces/SftpProviderOptions.md) | Optional ssh2 host-key verifier and timeout defaults. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createSftpProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createSftpProviderFactory()] });

const session = await client.connect({
  host: "sftp.example.com",
  provider: "sftp",
  username: "deploy",
  ssh: {
    privateKey: { path: "./keys/id_ed25519" },
    // Optional but recommended for production:
    pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
  },
});
```

Host-key verification (`ssh.knownHosts` and/or `ssh.pinnedHostKeySha256`) is
optional; without either, the client trusts whatever host key the server
presents. Use one for any non-lab deployment.
