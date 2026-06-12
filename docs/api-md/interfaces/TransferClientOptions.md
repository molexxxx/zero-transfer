[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClientOptions

# Interface: TransferClientOptions

Defined in: [src/core/TransferClient.ts:70](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/core/TransferClient.ts#L70)

Options used to create a provider-neutral transfer client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaults"></a> `defaults?` | [`TransferClientDefaults`](TransferClientDefaults.md) | Execution defaults applied when call sites omit their own values. | [src/core/TransferClient.ts:78](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/core/TransferClient.ts#L78) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Structured logger used for client lifecycle records. | [src/core/TransferClient.ts:76](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/core/TransferClient.ts#L76) |
| <a id="providers"></a> `providers?` | [`ProviderFactory`](ProviderFactory.md)\<[`TransferProvider`](TransferProvider.md)\<[`TransferSession`](TransferSession.md)\<`unknown`\>\>\>[] | Provider factories to register with the client registry. | [src/core/TransferClient.ts:74](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/core/TransferClient.ts#L74) |
| <a id="registry"></a> `registry?` | [`ProviderRegistry`](../classes/ProviderRegistry.md) | Existing registry to reuse. When omitted, a fresh empty registry is created. | [src/core/TransferClient.ts:72](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/core/TransferClient.ts#L72) |
