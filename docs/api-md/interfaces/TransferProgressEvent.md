[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:375](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L375)

Progress snapshot emitted while a transfer is running.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytespersecond"></a> `bytesPerSecond` | `number` | Current average throughput in bytes per second. | [src/types/public.ts:387](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L387) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far. | [src/types/public.ts:379](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L379) |
| <a id="elapsedms"></a> `elapsedMs` | `number` | Elapsed transfer time in milliseconds. | [src/types/public.ts:385](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L385) |
| <a id="percent"></a> `percent?` | `number` | Completion percentage when `totalBytes` is known. | [src/types/public.ts:389](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L389) |
| <a id="startedat"></a> `startedAt` | `Date` | Time at which the transfer began. | [src/types/public.ts:383](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L383) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:381](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L381) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used to correlate logs and events. | [src/types/public.ts:377](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L377) |
