[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSequentialPartReader

# Function: createSequentialPartReader()

```ts
function createSequentialPartReader(options): MultipartPartReader;
```

Defined in: [src/providers/web/multipartUploadPool.ts:73](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L73)

Creates a mutex-guarded sequential part reader over a byte stream.

Part numbers and byte ranges are assigned deterministically at cut time:
with the same source and part size, part N always contains the same bytes
no matter how many concurrent workers consume the reader.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`SequentialPartReaderOptions`](../interfaces/SequentialPartReaderOptions.md) | Source stream, part size, and optional resume offsets. |

## Returns

[`MultipartPartReader`](../interfaces/MultipartPartReader.md)

Reader whose `next()` yields parts in cut order.
