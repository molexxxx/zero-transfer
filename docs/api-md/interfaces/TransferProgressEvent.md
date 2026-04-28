[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / TransferProgressEvent

# Interface: TransferProgressEvent

Defined in: [src/types/public.ts:248](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L248)

Progress snapshot emitted while a transfer is running.

## Properties

| Property                                         | Type     | Description                                                                   | Defined in                                                                                                                                    |
| ------------------------------------------------ | -------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="bytespersecond"></a> `bytesPerSecond`     | `number` | Current average throughput in bytes per second.                               | [src/types/public.ts:260](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L260) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Bytes successfully transferred so far.                                        | [src/types/public.ts:252](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L252) |
| <a id="elapsedms"></a> `elapsedMs`               | `number` | Elapsed transfer time in milliseconds.                                        | [src/types/public.ts:258](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L258) |
| <a id="percent"></a> `percent?`                  | `number` | Completion percentage when `totalBytes` is known.                             | [src/types/public.ts:262](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L262) |
| <a id="startedat"></a> `startedAt`               | `Date`   | Time at which the transfer began.                                             | [src/types/public.ts:256](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L256) |
| <a id="totalbytes"></a> `totalBytes?`            | `number` | Total expected bytes when the adapter can determine the remote or local size. | [src/types/public.ts:254](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L254) |
| <a id="transferid"></a> `transferId`             | `string` | Stable transfer identifier used to correlate logs and events.                 | [src/types/public.ts:250](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L250) |
