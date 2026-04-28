[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferQueueExecutorResolver

# Type Alias: TransferQueueExecutorResolver

```ts
type TransferQueueExecutorResolver = (job) => TransferExecutor;
```

Defined in: [src/transfers/TransferQueue.ts:25](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L25)

Resolver used when jobs do not provide an executor at enqueue time.

## Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `job`     | [`TransferJob`](../interfaces/TransferJob.md) |

## Returns

[`TransferExecutor`](TransferExecutor.md)
