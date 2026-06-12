[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferSourceFingerprint

# Interface: TransferSourceFingerprint

Defined in: [src/transfers/TransferCheckpointStore.ts:73](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L73)

Source-object fingerprint captured when a checkpoint is written.

On resume the current source fingerprint is compared against the stored
one; any mismatch invalidates the checkpoint so a changed source file is
never spliced onto stale destination bytes. At least one field must be
comparable for a checkpoint to be considered valid.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="etag"></a> `etag?` | `string` | Source entity tag / unique id when the provider exposes one. | [src/transfers/TransferCheckpointStore.ts:79](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L79) |
| <a id="modifiedatms"></a> `modifiedAtMs?` | `number` | Source modification time in epoch milliseconds when known. | [src/transfers/TransferCheckpointStore.ts:77](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L77) |
| <a id="sizebytes"></a> `sizeBytes?` | `number` | Source size in bytes when known. | [src/transfers/TransferCheckpointStore.ts:75](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferCheckpointStore.ts#L75) |
