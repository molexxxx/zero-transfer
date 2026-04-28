[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createTransferClient

# Function: createTransferClient()

```ts
function createTransferClient(options?): TransferClient;
```

Defined in: [src/core/createTransferClient.ts:56](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/createTransferClient.ts#L56)

Creates a provider-neutral transfer client.

The returned client owns a registry of provider factories and produces
`TransferSession` instances on demand via [TransferClient.connect](../classes/TransferClient.md#connect).
Registering only the providers you actually use keeps bundle size small
(each factory pulls in its own SDK dependencies).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferClientOptions`](../interfaces/TransferClientOptions.md) | Optional registry, provider factories, and logger. |

## Returns

[`TransferClient`](../classes/TransferClient.md)

A disconnected [TransferClient](../classes/TransferClient.md) instance.

## Examples

```ts
import {
  createS3ProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
} from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createSftpProviderFactory(), createS3ProviderFactory()],
});

const session = await client.connect({
  host: "sftp.example.com",
  provider: "sftp",
  username: "deploy",
  ssh: { privateKey: { path: "./keys/id_ed25519" } },
});
try {
  const list = await session.fs.list("/uploads");
  console.log(list);
} finally {
  await session.disconnect();
}
```

```ts
import { uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  destination: { path: "/uploads/report.csv", profile },
  localPath: "./out/report.csv",
});
```
