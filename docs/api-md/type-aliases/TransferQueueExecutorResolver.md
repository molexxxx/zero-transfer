[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueExecutorResolver

# Type Alias: TransferQueueExecutorResolver

```ts
type TransferQueueExecutorResolver = (job) => TransferExecutor;
```

Defined in: [src/transfers/TransferQueue.ts:25](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/transfers/TransferQueue.ts#L25)

Resolver used when jobs do not provide an executor at enqueue time.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) |

## Returns

[`TransferExecutor`](TransferExecutor.md)
