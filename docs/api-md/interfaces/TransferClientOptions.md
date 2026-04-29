[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClientOptions

# Interface: TransferClientOptions

Defined in: [src/core/TransferClient.ts:23](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferClient.ts#L23)

Options used to create a provider-neutral transfer client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Structured logger used for client lifecycle records. | [src/core/TransferClient.ts:29](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferClient.ts#L29) |
| <a id="providers"></a> `providers?` | [`ProviderFactory`](ProviderFactory.md)\<[`TransferProvider`](TransferProvider.md)\<[`TransferSession`](TransferSession.md)\<`unknown`\>\>\>[] | Provider factories to register with the client registry. | [src/core/TransferClient.ts:27](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferClient.ts#L27) |
| <a id="registry"></a> `registry?` | [`ProviderRegistry`](../classes/ProviderRegistry.md) | Existing registry to reuse. When omitted, a fresh empty registry is created. | [src/core/TransferClient.ts:25](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferClient.ts#L25) |
