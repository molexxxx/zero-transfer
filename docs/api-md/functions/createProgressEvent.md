[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createProgressEvent

# Function: createProgressEvent()

```ts
function createProgressEvent(input): TransferProgressEvent;
```

Defined in: [src/services/TransferService.ts:80](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/services/TransferService.ts#L80)

Creates a progress event with elapsed time, rate, and optional percentage.

## Parameters

| Parameter | Type                                                        | Description                                                                  |
| --------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `input`   | [`ProgressEventInput`](../interfaces/ProgressEventInput.md) | Transfer id, byte count, start time, optional current time, and total bytes. |

## Returns

[`TransferProgressEvent`](../interfaces/TransferProgressEvent.md)

A normalized transfer progress event.
