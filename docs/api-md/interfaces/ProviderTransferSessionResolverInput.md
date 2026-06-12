[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferSessionResolverInput

# Interface: ProviderTransferSessionResolverInput

Defined in: [src/transfers/createProviderTransferExecutor.ts:43](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/createProviderTransferExecutor.ts#L43)

Input passed to provider transfer session resolvers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="endpoint"></a> `endpoint` | [`TransferEndpoint`](TransferEndpoint.md) | Endpoint being resolved. | [src/transfers/createProviderTransferExecutor.ts:45](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/createProviderTransferExecutor.ts#L45) |
| <a id="job"></a> `job` | [`TransferJob`](TransferJob.md) | Job currently being executed. | [src/transfers/createProviderTransferExecutor.ts:49](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/createProviderTransferExecutor.ts#L49) |
| <a id="role"></a> `role` | [`ProviderTransferEndpointRole`](../type-aliases/ProviderTransferEndpointRole.md) | Whether the endpoint is the source or destination side of the transfer. | [src/transfers/createProviderTransferExecutor.ts:47](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/createProviderTransferExecutor.ts#L47) |
