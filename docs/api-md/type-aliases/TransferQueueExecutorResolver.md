[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueExecutorResolver

# Type Alias: TransferQueueExecutorResolver

```ts
type TransferQueueExecutorResolver = (job) => TransferExecutor;
```

Defined in: [src/transfers/TransferQueue.ts:26](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/TransferQueue.ts#L26)

Resolver used when jobs do not provide an executor at enqueue time.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) |

## Returns

[`TransferExecutor`](TransferExecutor.md)
