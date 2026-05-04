[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / copyBetween

# Function: copyBetween()

```ts
function copyBetween(options): Promise<TransferReceipt>;
```

Defined in: [src/client/operations.ts:196](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/client/operations.ts#L196)

Copies a file between two remote endpoints in a single call.

Both source and destination providers must be registered with the
[TransferClient](../classes/TransferClient.md). Streams are piped end-to-end without staging the file
on the local disk.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CopyBetweenOptions`](../interfaces/CopyBetweenOptions.md) | Friendly copy options. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Example

```ts
import {
  copyBetween,
  createS3ProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
} from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createSftpProviderFactory(), createS3ProviderFactory()],
});

await copyBetween({
  client,
  source: {
    path: "/exports/daily.csv",
    profile: { host: "sftp.example.com", provider: "sftp", username: "etl" },
  },
  destination: {
    path: "warehouse/daily.csv",
    profile: { host: "warehouse", provider: "s3", s3: { region: "us-east-1" } },
  },
});
```
