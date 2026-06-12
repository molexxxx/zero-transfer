[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointKey

# Interface: TransferCheckpointKey

Defined in: src/transfers/TransferCheckpointStore.ts:56

Identity of a checkpointed transfer: the source and destination
provider/path pair.

Two processes (or two attempts) that move the same source path to the same
destination path resolve to the same key, which is what makes cross-process
resume possible. Endpoint paths do not embed hostnames; when the same
provider/path pair can refer to different servers (for example two SFTP
accounts both exposing `/data/out.bin`), set
[TransferResumeOptions.scope](TransferResumeOptions.md#scope) to disambiguate.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="destination"></a> `destination` | [`TransferCheckpointEndpoint`](TransferCheckpointEndpoint.md) | Destination endpoint of the transfer. | src/transfers/TransferCheckpointStore.ts:60 |
| <a id="scope"></a> `scope?` | `string` | Optional caller-supplied namespace (for example a host or profile id). | src/transfers/TransferCheckpointStore.ts:62 |
| <a id="source"></a> `source` | [`TransferCheckpointEndpoint`](TransferCheckpointEndpoint.md) | Source endpoint of the transfer. | src/transfers/TransferCheckpointStore.ts:58 |
