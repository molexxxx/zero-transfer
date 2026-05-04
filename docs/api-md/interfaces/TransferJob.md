[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferJob

# Interface: TransferJob

Defined in: [src/transfers/TransferJob.ts:27](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L27)

Transfer job input consumed by [TransferEngine](../classes/TransferEngine.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="destination"></a> `destination?` | [`TransferEndpoint`](TransferEndpoint.md) | Destination endpoint for operations that write data. | [src/transfers/TransferJob.ts:35](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L35) |
| <a id="id"></a> `id` | `string` | Stable job identifier for correlation. | [src/transfers/TransferJob.ts:29](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L29) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/transfers/TransferJob.ts:41](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L41) |
| <a id="operation"></a> `operation` | [`TransferOperation`](../type-aliases/TransferOperation.md) | Operation the job performs. | [src/transfers/TransferJob.ts:31](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L31) |
| <a id="resumed"></a> `resumed?` | `boolean` | Whether this job is resuming prior partial work. | [src/transfers/TransferJob.ts:39](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L39) |
| <a id="source"></a> `source?` | [`TransferEndpoint`](TransferEndpoint.md) | Source endpoint for operations that read data. | [src/transfers/TransferJob.ts:33](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L33) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Expected total bytes when known before execution. | [src/transfers/TransferJob.ts:37](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L37) |
