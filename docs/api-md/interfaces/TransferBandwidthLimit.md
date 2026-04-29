[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferBandwidthLimit

# Interface: TransferBandwidthLimit

Defined in: [src/transfers/TransferJob.ts:45](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L45)

Optional throughput limit shape that concrete transfer executors may honor.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="burstbytes"></a> `burstBytes?` | `number` | Optional burst allowance in bytes for token-bucket-style implementations. | [src/transfers/TransferJob.ts:49](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L49) |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Maximum sustained transfer rate in bytes per second. | [src/transfers/TransferJob.ts:47](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/transfers/TransferJob.ts#L47) |
