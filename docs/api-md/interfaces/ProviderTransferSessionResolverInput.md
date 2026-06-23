[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolverInput

# Interface: ProviderTransferSessionResolverInput

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createProviderTransferExecutor.ts#L43)

Input passed to provider transfer session resolvers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint being resolved. | [src/transfers/createProviderTransferExecutor.ts:45](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createProviderTransferExecutor.ts#L45) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job currently being executed. | [src/transfers/createProviderTransferExecutor.ts:49](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createProviderTransferExecutor.ts#L49) |
| <a id="role"></a> `role` | [`ProviderTransferEndpointRole`](../type-aliases/ProviderTransferEndpointRole.md) | Whether the endpoint is the source or destination side of the transfer. | [src/transfers/createProviderTransferExecutor.ts:47](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createProviderTransferExecutor.ts#L47) |
