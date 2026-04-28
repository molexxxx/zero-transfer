[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferExecutorOptions

# Interface: ProviderTransferExecutorOptions

Defined in: [src/transfers/createProviderTransferExecutor.ts:48](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/createProviderTransferExecutor.ts#L48)

Options for [createProviderTransferExecutor](../functions/createProviderTransferExecutor.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="resolvesession"></a> `resolveSession` | [`ProviderTransferSessionResolver`](../type-aliases/ProviderTransferSessionResolver.md) | Resolves connected provider sessions for source and destination endpoints. | [src/transfers/createProviderTransferExecutor.ts:50](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/createProviderTransferExecutor.ts#L50) |
| <a id="throttle"></a> `throttle?` | [`BandwidthThrottleOptions`](BandwidthThrottleOptions.md) | Optional clock/sleep overrides for the bandwidth throttle. | [src/transfers/createProviderTransferExecutor.ts:52](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/createProviderTransferExecutor.ts#L52) |
