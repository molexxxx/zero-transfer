[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClientOptions

# Interface: TransferClientOptions

Defined in: [src/core/TransferClient.ts:60](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L60)

Options used to create a provider-neutral transfer client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaults"></a> `defaults?` | [`TransferClientDefaults`](TransferClientDefaults.md) | Execution defaults applied when call sites omit their own values. | [src/core/TransferClient.ts:68](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L68) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Structured logger used for client lifecycle records. | [src/core/TransferClient.ts:66](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L66) |
| <a id="providers"></a> `providers?` | [`ProviderFactory`](ProviderFactory.md)\<[`TransferProvider`](TransferProvider.md)\<[`TransferSession`](TransferSession.md)\<`unknown`\>\>\>[] | Provider factories to register with the client registry. | [src/core/TransferClient.ts:64](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L64) |
| <a id="registry"></a> `registry?` | [`ProviderRegistry`](../classes/ProviderRegistry.md) | Existing registry to reuse. When omitted, a fresh empty registry is created. | [src/core/TransferClient.ts:62](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L62) |
