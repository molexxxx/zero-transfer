[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / downloadFile

# Function: downloadFile()

```ts
function downloadFile(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:138](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/client/operations.ts#L138)

Downloads a single remote file to a local path.

The remote provider is resolved from `source.profile.provider`. The local
destination path is created (including parent directories) on demand.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DownloadFileOptions`](../interfaces/DownloadFileOptions.md) | Friendly download options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Example

```ts
import {
  createS3ProviderFactory,
  createTransferClient,
  downloadFile,
} from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createS3ProviderFactory()] });

await downloadFile({
  client,
  localPath: "./tmp/snapshot.tar.gz",
  source: {
    path: "snapshots/2026-04-28/snapshot.tar.gz",
    profile: {
      host: "snapshots", // S3 bucket
      provider: "s3",
      s3: { region: "us-east-1" },
    },
  },
});
```
