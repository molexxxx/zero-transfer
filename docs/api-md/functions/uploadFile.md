[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / uploadFile

# Function: uploadFile()

```ts
function uploadFile(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:83](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/client/operations.ts#L83)

Uploads a single local file to a remote endpoint.

The remote provider is resolved from `destination.profile.provider`, so any
provider factory you registered with [createTransferClient](createTransferClient.md) can be used
as the destination.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`UploadFileOptions`](../interfaces/UploadFileOptions.md) | Friendly upload options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Example

```ts
import {
  createSftpProviderFactory,
  createTransferClient,
  uploadFile,
} from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createSftpProviderFactory()] });

await uploadFile({
  client,
  destination: {
    path: "/uploads/report.csv",
    profile: {
      host: "sftp.example.com",
      provider: "sftp",
      username: "deploy",
      ssh: { privateKey: { path: "./keys/id_ed25519" } },
    },
  },
  localPath: "./out/report.csv",
});
```
