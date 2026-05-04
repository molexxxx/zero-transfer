[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolverInput

# Interface: ProviderTransferSessionResolverInput

Defined in: [src/transfers/createProviderTransferExecutor.ts:33](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/createProviderTransferExecutor.ts#L33)

Input passed to provider transfer session resolvers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint being resolved. | [src/transfers/createProviderTransferExecutor.ts:35](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/createProviderTransferExecutor.ts#L35) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job currently being executed. | [src/transfers/createProviderTransferExecutor.ts:39](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/createProviderTransferExecutor.ts#L39) |
| <a id="role"></a> `role` | [`ProviderTransferEndpointRole`](../type-aliases/ProviderTransferEndpointRole.md) | Whether the endpoint is the source or destination side of the transfer. | [src/transfers/createProviderTransferExecutor.ts:37](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/transfers/createProviderTransferExecutor.ts#L37) |
