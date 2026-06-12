[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferDiscardRequest

# Interface: ProviderTransferDiscardRequest

Defined in: [src/providers/ProviderTransferOperations.ts:89](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/ProviderTransferOperations.ts#L89)

Request passed to [ProviderTransferOperations.discardResumable](ProviderTransferOperations.md#discardresumable).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint whose orphaned resumable state should be discarded. | [src/providers/ProviderTransferOperations.ts:91](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/ProviderTransferOperations.ts#L91) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal active for the surrounding execution when supplied. | [src/providers/ProviderTransferOperations.ts:95](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/ProviderTransferOperations.ts#L95) |
| <a id="state"></a> `state` | [`TransferCheckpointState`](../type-aliases/TransferCheckpointState.md) | Checkpoint state being invalidated. | [src/providers/ProviderTransferOperations.ts:93](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/ProviderTransferOperations.ts#L93) |
