[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferExecutorOptions

# Interface: ProviderTransferExecutorOptions

Defined in: [src/transfers/createProviderTransferExecutor.ts:110](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/createProviderTransferExecutor.ts#L110)

Options for [createProviderTransferExecutor](../functions/createProviderTransferExecutor.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="resolvesession"></a> `resolveSession` | [`ProviderTransferSessionResolver`](../type-aliases/ProviderTransferSessionResolver.md) | Resolves connected provider sessions for source and destination endpoints. | [src/transfers/createProviderTransferExecutor.ts:112](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/createProviderTransferExecutor.ts#L112) |
| <a id="resume"></a> `resume?` | [`TransferResumeOptions`](TransferResumeOptions.md) | Checkpoint/resume configuration. Resume is disabled when omitted. | [src/transfers/createProviderTransferExecutor.ts:116](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/createProviderTransferExecutor.ts#L116) |
| <a id="throttle"></a> `throttle?` | [`BandwidthThrottleOptions`](BandwidthThrottleOptions.md) | Optional clock/sleep overrides for the bandwidth throttle. | [src/transfers/createProviderTransferExecutor.ts:114](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/createProviderTransferExecutor.ts#L114) |
