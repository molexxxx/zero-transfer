[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFileSystemTransferCheckpointStore

# Function: createFileSystemTransferCheckpointStore()

```ts
function createFileSystemTransferCheckpointStore(options): TransferCheckpointStore;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:308](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L308)

File-system backed [TransferCheckpointStore](../interfaces/TransferCheckpointStore.md) that survives process
restarts, enabling cross-process resume.

Each checkpoint is one JSON file named after a SHA-256 hash of the
transfer key. Writes are atomic (`<file>.tmp` then `rename`) with mode
`0600`, so a crash mid-write cannot leave a corrupt checkpoint and other
local users cannot read transfer metadata. Corrupt or expired files are
deleted on load and treated as absent.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`FileSystemTransferCheckpointStoreOptions`](../interfaces/FileSystemTransferCheckpointStoreOptions.md) |

## Returns

[`TransferCheckpointStore`](../interfaces/TransferCheckpointStore.md)

## Example

```ts
import {
  createFileSystemTransferCheckpointStore,
  createTransferClient,
  downloadFile,
} from "@zero-transfer/sdk";

const store = createFileSystemTransferCheckpointStore({
  directory: "./.zt-checkpoints",
});

const client = createTransferClient({
  providers: [createSftpProviderFactory(), createLocalProviderFactory()],
  defaults: { resume: { store } },
});

// Kill the process mid-transfer and run it again: the download resumes
// from the last committed byte instead of restarting.
await downloadFile({ client, source, destination });
```
