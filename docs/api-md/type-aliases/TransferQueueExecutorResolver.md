[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / TransferQueueExecutorResolver

# Type Alias: TransferQueueExecutorResolver

```ts
type TransferQueueExecutorResolver = (job) => TransferExecutor;
```

Defined in: [src/transfers/TransferQueue.ts:25](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferQueue.ts#L25)

Resolver used when jobs do not provide an executor at enqueue time.

## Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `job`     | [`TransferJob`](../interfaces/TransferJob.md) |

## Returns

[`TransferExecutor`](TransferExecutor.md)
