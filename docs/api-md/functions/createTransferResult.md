[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / createTransferResult

# Function: createTransferResult()

```ts
function createTransferResult(input): TransferResult;
```

Defined in: [src/services/TransferService.ts:55](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/services/TransferService.ts#L55)

Creates a final transfer result with duration and average throughput.

## Parameters

| Parameter | Type                                                          | Description                                                                 |
| --------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `input`   | [`TransferResultInput`](../interfaces/TransferResultInput.md) | Transfer paths, byte count, timestamps, and optional verification metadata. |

## Returns

[`TransferResult`](../interfaces/TransferResult.md)

A normalized transfer result.
