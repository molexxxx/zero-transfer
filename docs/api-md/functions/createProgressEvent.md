[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createProgressEvent

# Function: createProgressEvent()

```ts
function createProgressEvent(input): TransferProgressEvent;
```

Defined in: [src/services/TransferService.ts:80](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/services/TransferService.ts#L80)

Creates a progress event with elapsed time, rate, and optional percentage.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`ProgressEventInput`](../interfaces/ProgressEventInput.md) | Transfer id, byte count, start time, optional current time, and total bytes. |

## Returns

[`TransferProgressEvent`](../interfaces/TransferProgressEvent.md)

A normalized transfer progress event.
